package com.myreport.backend.service;

import com.myreport.backend.dto.admin.BillingRequest;
import com.myreport.backend.dto.admin.ChangePasswordRequest;
import com.myreport.backend.dto.admin.CustomerRequest;
import com.myreport.backend.dto.admin.ProductRequest;
import com.myreport.backend.dto.admin.ProfileUpdateRequest;
import com.myreport.backend.entity.Customer;
import com.myreport.backend.entity.Invoice;
import com.myreport.backend.entity.InvoiceItem;
import com.myreport.backend.entity.Order;
import com.myreport.backend.entity.Product;
import com.myreport.backend.entity.Store;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.InvoiceStatus;
import com.myreport.backend.entity.enums.Role;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.CustomerRepository;
import com.myreport.backend.repository.InvoiceItemRepository;
import com.myreport.backend.repository.InvoiceRepository;
import com.myreport.backend.repository.OrderRepository;
import com.myreport.backend.repository.ProductRepository;
import com.myreport.backend.repository.StoreRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AdminService {
    private static final double LOW_STOCK_QUANTITY = 10d;
    private static final long MAX_PROFILE_PHOTO_SIZE = 5L * 1024L * 1024L;
    private static final String STRONG_PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";

    private final UserAccountRepository userAccountRepository;
    private final StoreRepository storeRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final PlanDateService planDateService;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String email) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        List<Product> products = productRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        List<Customer> customers = customerRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        List<Invoice> invoices = invoiceRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());

        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime nextMonthStart = currentMonth.plusMonths(1).atDay(1).atStartOfDay();

        BigDecimal todaysSales = calculateTodaySales(admin.getId());
        BigDecimal monthlySales = calculateSalesBetween(admin.getId(), monthStart, nextMonthStart);
        long lowStockCount = products.stream()
                .filter(product -> product.getQuantity() <= LOW_STOCK_QUANTITY)
                .count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("metrics", List.of(
                metric("Today's Sales", "Rs. " + todaysSales.setScale(0, RoundingMode.HALF_UP), "Cashflow today", "cyan"),
                metric("Monthly Sales", "Rs. " + monthlySales.setScale(0, RoundingMode.HALF_UP), YearMonth.now().getMonth().name(), "emerald"),
                metric("Products", String.valueOf(products.size()), "Catalog currently live", "violet"),
                metric("Low Stock", String.valueOf(lowStockCount), "Needs immediate attention", "amber")
        ));
        data.put("revenueSeries", buildRevenueSeries(invoices));
        data.put("topSales", buildTopSales(admin.getId()));
        LocalDate planExpiresAt = calculatePlanExpiry(store);
        data.put("store", Map.of(
                "storeCode", store.getStoreCode() == null ? "" : store.getStoreCode(),
                "name", store.getName(),
                "city", store.getCity(),
                "plan", store.getPlan() != null ? store.getPlan().getName() : null,
                "planExpiresAt", planExpiresAt
        ));
        data.put("highlights", List.of(
                "Customer base: " + customers.size(),
                "Active invoices: " + invoices.size(),
                "Available products: " + products.stream().filter(Product::isActive).count()
        ));
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTodaySales(String email) {
        UserAccount admin = getAdmin(email);
        BigDecimal todaysSales = calculateTodaySales(admin.getId());
        return Map.of(
                "amount", todaysSales,
                "displayAmount", "Rs. " + todaysSales.setScale(0, RoundingMode.HALF_UP),
                "date", LocalDate.now()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCustomers(String email) {
        UserAccount admin = getAdmin(email);
        List<Map<String, Object>> items = customerRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId()).stream()
                .map(this::mapCustomer)
                .toList();
        return Map.of("items", items);
    }

    @Transactional
    public Map<String, Object> createCustomer(String email, CustomerRequest request) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        Customer customer = Customer.builder()
                .fullName(request.fullName())
                .email(request.email())
                .mobileNumber(request.mobileNumber())
                .city(request.city())
                .blocked(Boolean.TRUE.equals(request.blocked()))
                .store(store)
                .build();
        customerRepository.save(customer);
        return mapCustomer(customer);
    }

    @Transactional
    public Map<String, Object> updateCustomer(String email, Long customerId, CustomerRequest request) {
        UserAccount admin = getAdmin(email);
        Customer customer = getCustomer(admin.getId(), customerId);
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setMobileNumber(request.mobileNumber());
        customer.setCity(request.city());
        customer.setBlocked(Boolean.TRUE.equals(request.blocked()));
        customerRepository.save(customer);
        return mapCustomer(customer);
    }

    @Transactional
    public Map<String, Object> toggleCustomerBlock(String email, Long customerId) {
        UserAccount admin = getAdmin(email);
        Customer customer = getCustomer(admin.getId(), customerId);
        customer.setBlocked(!customer.isBlocked());
        customerRepository.save(customer);
        return mapCustomer(customer);
    }

    @Transactional
    public void deleteCustomer(String email, Long customerId) {
        UserAccount admin = getAdmin(email);
        Customer customer = getCustomer(admin.getId(), customerId);
        orderRepository.deleteByCustomerIdAndOwnerId(customer.getId(), admin.getId());
        customerRepository.delete(customer);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProducts(String email) {
        UserAccount admin = getAdmin(email);
        List<Map<String, Object>> items = productRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId()).stream()
                .map(this::mapProduct)
                .toList();
        return Map.of("items", items);
    }

    @Transactional
    public Map<String, Object> createProduct(String email, ProductRequest request) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        Product product = Product.builder()
                .name(request.name())
                .price(request.price())
                .quantity(request.quantity())
                .unit(request.unit())
                .active(request.active() == null || request.active())
                .store(store)
                .build();
        productRepository.save(product);
        return mapProduct(product);
    }

    @Transactional
    public Map<String, Object> updateProduct(String email, Long productId, ProductRequest request) {
        UserAccount admin = getAdmin(email);
        Product product = getProduct(admin.getId(), productId);
        product.setName(request.name());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
        product.setUnit(request.unit());
        product.setActive(request.active() == null || request.active());
        productRepository.save(product);
        return mapProduct(product);
    }

    @Transactional
    public void deleteProduct(String email, Long productId) {
        UserAccount admin = getAdmin(email);
        Product product = getProduct(admin.getId(), productId);
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInvoices(String email) {
        UserAccount admin = getAdmin(email);
        List<Invoice> invoices = invoiceRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        List<Map<String, Object>> items = invoices.stream().map(this::mapInvoice).toList();

        BigDecimal todaysSales = invoices.stream()
                .filter(invoice -> invoice.getCreatedAt().toLocalDate().isEqual(LocalDate.now()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "items", items,
                "summary", Map.of(
                        "todaysSales", todaysSales,
                        "todaysInvoices", invoices.stream()
                                .filter(invoice -> invoice.getCreatedAt().toLocalDate().isEqual(LocalDate.now()))
                                .count()
                )
        );
    }

    @Transactional
    public Map<String, Object> createInvoice(String email, BillingRequest request) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        List<Product> products = productRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        Map<Long, Product> productsById = new HashMap<>();
        Map<String, Product> productsByName = new HashMap<>();
        products.forEach(product -> {
            productsById.put(product.getId(), product);
            productsByName.put(product.getName().trim().toLowerCase(), product);
        });

        Map<Long, Double> requestedQuantityByProduct = new HashMap<>();
        Map<Long, Product> requestedProducts = new HashMap<>();
        request.items().forEach(item -> {
            Product product = resolveBillingProduct(item, productsById, productsByName);
            requestedQuantityByProduct.merge(product.getId(), item.quantity(), Double::sum);
            requestedProducts.put(product.getId(), product);
        });

        requestedQuantityByProduct.forEach((productId, requestedQuantity) -> {
            Product product = requestedProducts.get(productId);
            if (product.getQuantity() < requestedQuantity) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName() + ". Available quantity: " + product.getQuantity()
                );
            }
        });

        BigDecimal subtotal = request.items().stream()
                .map(item -> item.rate().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal gstPercentage = request.gstPercentage() == null ? BigDecimal.ZERO : request.gstPercentage();
        BigDecimal taxAmount = subtotal.multiply(gstPercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal discountAmount = request.discountAmount() == null ? BigDecimal.ZERO : request.discountAmount();
        BigDecimal grossAmount = subtotal.add(taxAmount);
        if (discountAmount.compareTo(grossAmount) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Discount amount cannot be greater than subtotal plus tax");
        }
        BigDecimal totalAmount = subtotal.add(taxAmount).subtract(discountAmount);

        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV-" + System.currentTimeMillis())
                .customerName(request.customerName())
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .status(InvoiceStatus.PAID)
                .notes(request.notes())
                .store(store)
                .build();
        invoiceRepository.save(invoice);

        Customer matchedCustomer = customerRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId()).stream()
                .filter(customer -> customer.getFullName().equalsIgnoreCase(request.customerName()))
                .findFirst()
                .orElse(null);

        if (matchedCustomer != null) {
            matchedCustomer.setTotalSpent(matchedCustomer.getTotalSpent().add(totalAmount));
            matchedCustomer.setPurchaseCount(matchedCustomer.getPurchaseCount() + 1);
            customerRepository.save(matchedCustomer);
        }

        List<Order> orders = new ArrayList<>();
        List<InvoiceItem> invoiceItems = new ArrayList<>();

        request.items().forEach(item -> {
            Product product = resolveBillingProduct(item, productsById, productsByName);
            BigDecimal lineTotal = item.rate().multiply(BigDecimal.valueOf(item.quantity()));
            product.setQuantity(Math.max(0, product.getQuantity() - item.quantity()));
            productRepository.save(product);
            invoiceItems.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .productName(product.getName())
                    .quantity(item.quantity())
                    .rate(item.rate())
                    .totalAmount(lineTotal)
                    .unit(product.getUnit())
                    .build());

            if (matchedCustomer != null) {
                orders.add(Order.builder()
                        .customer(matchedCustomer)
                        .product(product)
                        .store(store)
                        .quantity(item.quantity())
                        .price(item.rate())
                        .totalAmount(lineTotal)
                        .build());
            }
        });

        invoiceItemRepository.saveAll(invoiceItems);

        if (!orders.isEmpty()) {
            orderRepository.saveAll(orders);
        }

        BigDecimal todaysSales = calculateTodaySales(admin.getId());
        YearMonth currentMonth = YearMonth.now();
        BigDecimal monthlySales = calculateSalesBetween(
                admin.getId(),
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.plusMonths(1).atDay(1).atStartOfDay()
        );

        return Map.of(
                "invoiceNumber", invoice.getInvoiceNumber(),
                "subtotal", subtotal,
                "taxAmount", taxAmount,
                "discountAmount", discountAmount,
                "totalAmount", totalAmount,
                "todaySales", todaysSales,
                "todaySalesDisplay", "Rs. " + todaysSales.setScale(0, RoundingMode.HALF_UP),
                "monthlySales", monthlySales,
                "monthlySalesDisplay", "Rs. " + monthlySales.setScale(0, RoundingMode.HALF_UP),
                "createdAt", invoice.getCreatedAt()
        );
    }

    @Transactional
    public Map<String, Object> getPlan(String email) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        if (store.getPlan() == null) {
            return Map.of("plan", null);
        }
        String planName = store.getPlan().getName() == null ? "" : store.getPlan().getName();
        boolean freeTrial = planDateService.isFreeTrial(store.getPlan());
        BigDecimal monthlyPrice = store.getPlan().getMonthlyPrice() == null ? BigDecimal.ZERO : store.getPlan().getMonthlyPrice();
        String duration = planDateService.displayDuration(store.getPlan());
        LocalDate planStartedAt = resolvePlanStartDate(store);
        LocalDate planExpiresAt = planDateService.calculateExpiry(store.getPlan(), planStartedAt);
        if (store.getPlanStartedAt() == null || !planExpiresAt.equals(store.getPlanExpiresAt())) {
            store.setPlanStartedAt(planStartedAt);
            store.setPlanExpiresAt(planExpiresAt);
            storeRepository.save(store);
        }

        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("name", planName);
        plan.put("description", store.getPlan().getDescription());
        plan.put("monthlyPrice", monthlyPrice);
        plan.put("yearlyPrice", store.getPlan().getYearlyPrice());
        plan.put("maxProducts", store.getPlan().getMaxProducts());
        plan.put("maxCustomers", store.getPlan().getMaxCustomers());
        plan.put("features", store.getPlan().getFeatures());
        plan.put("duration", duration);
        plan.put("freeTrial", freeTrial);
        plan.put("displayPrice", freeTrial ? "Rs. 0 / 7 Days" : ("Rs. " + monthlyPrice.setScale(0, RoundingMode.HALF_UP) + " / month"));
        plan.put("actionLabel", freeTrial ? "Upgrade Plan" : "Renew with PayU");
        plan.put("startedAt", planStartedAt);
        plan.put("expiresAt", planExpiresAt);
        plan.put("daysLeft", ChronoUnit.DAYS.between(LocalDate.now(), planExpiresAt));

        return Map.of("plan", plan);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReports(String email, LocalDate startDate, LocalDate endDate) {
        UserAccount admin = getAdmin(email);
        LocalDate effectiveStart = startDate == null ? LocalDate.now().minusDays(180) : startDate;
        LocalDate effectiveEnd = endDate == null ? LocalDate.now() : endDate;
        List<Invoice> invoices = invoiceRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId()).stream()
                .filter(invoice -> {
                    LocalDate date = invoice.getCreatedAt().toLocalDate();
                    return !date.isBefore(effectiveStart) && !date.isAfter(effectiveEnd);
                })
                .toList();
        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of(
                "summary", Map.of(
                        "revenue", totalRevenue,
                        "invoices", invoices.size(),
                        "customers", customerRepository.countByStoreOwnerId(admin.getId()),
                        "products", productRepository.countByStoreOwnerId(admin.getId())
                ),
                "series", buildRevenueSeries(invoices),
                "range", Map.of("startDate", effectiveStart, "endDate", effectiveEnd)
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings(String email) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("fullName", admin.getFullName());
        profile.put("email", admin.getEmail());
        profile.put("mobileNumber", admin.getMobileNumber());
        profile.put("city", admin.getCity());
        profile.put("address", admin.getAddress());
        profile.put("storeCode", store.getStoreCode() == null ? "" : store.getStoreCode());
        profile.put("storeName", store.getName());
        profile.put("avatarUrl", admin.getAvatarUrl());
        return Map.of("profile", profile);
    }

    @Transactional
    public Map<String, Object> updateProfile(String email, ProfileUpdateRequest request) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        admin.setFullName(request.fullName());
        admin.setMobileNumber(request.mobileNumber());
        admin.setCity(request.city());
        admin.setAddress(request.address());
        admin.setStoreName(request.storeName());
        store.setName(request.storeName());
        store.setCity(request.city());
        store.setAddress(request.address());
        userAccountRepository.save(admin);
        storeRepository.save(store);
        return getSettings(email);
    }

    @Transactional
    public Map<String, Object> uploadProfilePhoto(String email, MultipartFile file) {
        UserAccount admin = getAdmin(email);
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please select an image file");
        }
        if (file.getSize() > MAX_PROFILE_PHOTO_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image size must be 5MB or less");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.equals("image/jpeg") && !contentType.equals("image/jpg")
                && !contentType.equals("image/png") && !contentType.equals("image/webp")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, and WEBP images are allowed");
        }

        String extension = extensionForContentType(contentType);
        Path uploadDir = Paths.get("uploads", "profile").toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
            String fileName = "avatar-" + admin.getId() + "-" + UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            admin.setAvatarUrl("/uploads/profile/" + fileName);
            userAccountRepository.save(admin);
            return getSettings(email);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload profile photo");
        }
    }

    @Transactional
    public Map<String, Object> removeProfilePhoto(String email) {
        UserAccount admin = getAdmin(email);
        admin.setAvatarUrl(null);
        userAccountRepository.save(admin);
        return getSettings(email);
    }

    @Transactional
    public Map<String, Object> changePassword(String email, ChangePasswordRequest request) {
        UserAccount admin = getAdmin(email);
        if (!passwordEncoder.matches(request.currentPassword(), admin.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (request.newPassword() == null || !request.newPassword().matches(STRONG_PASSWORD_REGEX)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters and include uppercase, lowercase, number, and special character");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password and confirm password must match");
        }
        admin.setPassword(passwordEncoder.encode(request.newPassword()));
        userAccountRepository.save(admin);
        return Map.of("changed", true);
    }

    private UserAccount getAdmin(String email) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return admin;
    }

    private Store getStore(Long adminId) {
        return storeRepository.findByOwnerId(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found"));
    }

    private Customer getCustomer(Long adminId, Long customerId) {
        return customerRepository.findByStoreOwnerIdOrderByCreatedAtDesc(adminId).stream()
                .filter(customer -> customer.getId().equals(customerId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    private Product getProduct(Long adminId, Long productId) {
        return productRepository.findByStoreOwnerIdOrderByCreatedAtDesc(adminId).stream()
                .filter(product -> product.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private LocalDate calculatePlanExpiry(Store store) {
        if (store == null || store.getPlan() == null) {
            return store != null ? store.getPlanExpiresAt() : null;
        }
        return planDateService.calculateExpiry(store.getPlan(), resolvePlanStartDate(store));
    }

    private LocalDate resolvePlanStartDate(Store store) {
        if (store.getPlanStartedAt() != null) {
            return store.getPlanStartedAt();
        }
        if (store.getCreatedAt() != null) {
            return store.getCreatedAt().toLocalDate();
        }
        return LocalDate.now();
    }

    private BigDecimal calculateTodaySales(Long ownerId) {
        LocalDate today = LocalDate.now();
        return calculateSalesBetween(
                ownerId,
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
    }

    private BigDecimal calculateSalesBetween(Long ownerId, LocalDateTime start, LocalDateTime end) {
        BigDecimal total = invoiceRepository.sumTotalAmountByOwnerIdAndCreatedAtBetween(ownerId, start, end);
        return total == null ? BigDecimal.ZERO : total;
    }

    private Product resolveBillingProduct(
            com.myreport.backend.dto.admin.BillingItemRequest item,
            Map<Long, Product> productsById,
            Map<String, Product> productsByName
    ) {
        Product product = item.productId() == null ? null : productsById.get(item.productId());
        if (product == null && item.productName() != null) {
            product = productsByName.get(item.productName().trim().toLowerCase());
        }
        if (product == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product not found in store: " + item.productName());
        }
        return product;
    }

    private Map<String, Object> mapCustomer(Customer customer) {
        return Map.of(
                "id", customer.getId(),
                "fullName", customer.getFullName(),
                "email", customer.getEmail() == null ? "" : customer.getEmail(),
                "mobileNumber", customer.getMobileNumber(),
                "city", customer.getCity() == null ? "" : customer.getCity(),
                "blocked", customer.isBlocked(),
                "totalSpent", customer.getTotalSpent(),
                "purchaseCount", customer.getPurchaseCount(),
                "createdAt", customer.getCreatedAt()
        );
    }

    private Map<String, Object> mapProduct(Product product) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", product.getId());
        data.put("name", product.getName());
        data.put("price", product.getPrice());
        data.put("quantity", product.getQuantity());
        data.put("unit", product.getUnit());
        data.put("active", product.isActive());
        data.put("lowStock", product.getQuantity() <= LOW_STOCK_QUANTITY);
        data.put("createdAt", product.getCreatedAt());
        return data;
    }

    private List<Map<String, Object>> buildRevenueSeries(List<Invoice> invoices) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        List<Map<String, Object>> series = new ArrayList<>();
        for (int index = 5; index >= 0; index--) {
            YearMonth month = YearMonth.from(today.minusMonths(index));
            BigDecimal total = invoices.stream()
                    .filter(invoice -> YearMonth.from(invoice.getCreatedAt()).equals(month))
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            series.add(seriesPoint(formatter.format(month.atDay(1)), total));
        }
        return series;
    }

    private List<Map<String, Object>> buildTopSales(Long ownerId) {
        List<Map<String, Object>> invoiceSales = invoiceItemRepository.findTopSalesByOwnerId(ownerId).stream()
                .limit(5)
                .map(this::topSaleItem)
                .toList();
        if (!invoiceSales.isEmpty()) {
            return invoiceSales;
        }
        return orderRepository.findTopSalesByOwnerId(ownerId).stream()
                .limit(5)
                .map(this::topSaleItem)
                .toList();
    }

    private Map<String, Object> mapInvoice(Invoice invoice) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", invoice.getId());
        data.put("invoiceNumber", invoice.getInvoiceNumber());
        data.put("customerName", invoice.getCustomerName());
        data.put("subtotal", invoice.getSubtotal());
        data.put("taxAmount", invoice.getTaxAmount());
        data.put("discountAmount", invoice.getDiscountAmount());
        data.put("totalAmount", invoice.getTotalAmount());
        data.put("status", invoice.getStatus());
        data.put("notes", invoice.getNotes());
        data.put("createdAt", invoice.getCreatedAt());
        return data;
    }

    private Map<String, Object> seriesPoint(String label, BigDecimal value) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("label", label);
        data.put("value", value);
        return data;
    }

    private Map<String, Object> topSaleItem(InvoiceItemRepository.TopSaleProjection item) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", item.getName());
        data.put("value", item.getQuantity());
        data.put("quantity", item.getQuantity());
        data.put("revenue", item.getRevenue());
        data.put("unit", item.getUnit());
        return data;
    }

    private Map<String, Object> topSaleItem(OrderRepository.TopSaleProjection item) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", item.getName());
        data.put("value", item.getQuantity());
        data.put("quantity", item.getQuantity());
        data.put("revenue", item.getRevenue());
        data.put("unit", item.getUnit());
        return data;
    }

    private Map<String, Object> metric(String label, String value, String helper, String accent) {
        return Map.of("label", label, "value", value, "helper", helper, "accent", accent);
    }

    private String extensionForContentType(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

}
