package com.myreport.backend.service;

import com.myreport.backend.dto.admin.BillingRequest;
import com.myreport.backend.dto.admin.ChangePasswordRequest;
import com.myreport.backend.dto.admin.CustomerRequest;
import com.myreport.backend.dto.admin.NotificationPreferenceRequest;
import com.myreport.backend.dto.admin.ProductRequest;
import com.myreport.backend.dto.admin.ProfileUpdateRequest;
import com.myreport.backend.entity.Customer;
import com.myreport.backend.entity.Invoice;
import com.myreport.backend.entity.Notification;
import com.myreport.backend.entity.Product;
import com.myreport.backend.entity.Store;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.InvoiceStatus;
import com.myreport.backend.entity.enums.NotificationType;
import com.myreport.backend.entity.enums.Role;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.CustomerRepository;
import com.myreport.backend.repository.InvoiceRepository;
import com.myreport.backend.repository.NotificationRepository;
import com.myreport.backend.repository.ProductRepository;
import com.myreport.backend.repository.StoreRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserAccountRepository userAccountRepository;
    private final StoreRepository storeRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String email) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        List<Product> products = productRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        List<Customer> customers = customerRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        List<Invoice> invoices = invoiceRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());

        BigDecimal todaysSales = invoices.stream()
                .filter(invoice -> invoice.getCreatedAt().toLocalDate().isEqual(LocalDate.now()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal monthlySales = invoices.stream()
                .filter(invoice -> YearMonth.from(invoice.getCreatedAt()).equals(YearMonth.now()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long lowStockCount = products.stream()
                .filter(product -> product.getQuantity() <= product.getReorderThreshold())
                .count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("metrics", List.of(
                metric("Today's Sales", "Rs. " + todaysSales.setScale(0, RoundingMode.HALF_UP), "Cashflow today", "cyan"),
                metric("Monthly Sales", "Rs. " + monthlySales.setScale(0, RoundingMode.HALF_UP), YearMonth.now().getMonth().name(), "emerald"),
                metric("Products", String.valueOf(products.size()), "Catalog currently live", "violet"),
                metric("Low Stock", String.valueOf(lowStockCount), "Needs immediate attention", "amber")
        ));
        data.put("revenueSeries", buildRevenueSeries(invoices));
        data.put("topSales", buildTopSales(products));
        data.put("notifications", mapNotifications(notificationRepository.findTop8ByUserIdOrderByCreatedAtDesc(admin.getId())));
        data.put("store", Map.of(
                "name", store.getName(),
                "city", store.getCity(),
                "plan", store.getPlan() != null ? store.getPlan().getName() : null,
                "planExpiresAt", store.getPlanExpiresAt()
        ));
        data.put("highlights", List.of(
                "Customer base: " + customers.size(),
                "Active invoices: " + invoices.size(),
                "Available products: " + products.stream().filter(Product::isActive).count()
        ));
        return data;
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
                .sku(request.sku())
                .price(request.price())
                .quantity(request.quantity())
                .reorderThreshold(request.reorderThreshold())
                .unit(request.unit())
                .active(request.active() == null || request.active())
                .store(store)
                .build();
        productRepository.save(product);
        if (product.getQuantity() <= product.getReorderThreshold()) {
            createNotification(admin, "Low stock alert", product.getName() + " is below the 35% safety threshold.", NotificationType.LOW_STOCK);
        }
        return mapProduct(product);
    }

    @Transactional
    public Map<String, Object> updateProduct(String email, Long productId, ProductRequest request) {
        UserAccount admin = getAdmin(email);
        Product product = getProduct(admin.getId(), productId);
        product.setName(request.name());
        product.setSku(request.sku());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
        product.setReorderThreshold(request.reorderThreshold());
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

        customerRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId()).stream()
                .filter(customer -> customer.getFullName().equalsIgnoreCase(request.customerName()))
                .findFirst()
                .ifPresent(customer -> {
                    customer.setTotalSpent(customer.getTotalSpent().add(totalAmount));
                    customer.setPurchaseCount(customer.getPurchaseCount() + 1);
                    customerRepository.save(customer);
                });

        List<Product> products = productRepository.findByStoreOwnerIdOrderByCreatedAtDesc(admin.getId());
        request.items().forEach(item -> products.stream()
                .filter(product -> product.getName().equalsIgnoreCase(item.productName()))
                .findFirst()
                .ifPresent(product -> {
                    product.setQuantity(Math.max(0, product.getQuantity() - item.quantity()));
                    productRepository.save(product);
                    if (product.getQuantity() <= product.getReorderThreshold()) {
                        createNotification(admin, "Low stock alert", product.getName() + " needs replenishment soon.", NotificationType.LOW_STOCK);
                    }
                }));

        createNotification(admin, "Payment success", "Invoice " + invoice.getInvoiceNumber() + " was generated successfully.", NotificationType.PAYMENT_SUCCESS);

        return Map.of(
                "invoiceNumber", invoice.getInvoiceNumber(),
                "subtotal", subtotal,
                "taxAmount", taxAmount,
                "discountAmount", discountAmount,
                "totalAmount", totalAmount,
                "createdAt", invoice.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlan(String email) {
        UserAccount admin = getAdmin(email);
        Store store = getStore(admin.getId());
        if (store.getPlan() == null) {
            return Map.of("plan", null);
        }
        return Map.of(
                "plan", Map.of(
                        "name", store.getPlan().getName(),
                        "description", store.getPlan().getDescription(),
                        "monthlyPrice", store.getPlan().getMonthlyPrice(),
                        "yearlyPrice", store.getPlan().getYearlyPrice(),
                        "maxProducts", store.getPlan().getMaxProducts(),
                        "maxCustomers", store.getPlan().getMaxCustomers(),
                        "features", store.getPlan().getFeatures(),
                        "expiresAt", store.getPlanExpiresAt(),
                        "daysLeft", ChronoUnit.DAYS.between(LocalDate.now(), store.getPlanExpiresAt())
                )
        );
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
        return Map.of(
                "profile", Map.of(
                        "fullName", admin.getFullName(),
                        "email", admin.getEmail(),
                        "mobileNumber", admin.getMobileNumber(),
                        "city", admin.getCity(),
                        "address", admin.getAddress(),
                        "storeName", store.getName()
                ),
                "preferences", Map.of(
                        "lowStockAlerts", admin.isLowStockAlerts(),
                        "planExpiryAlerts", admin.isPlanExpiryAlerts(),
                        "paymentAlerts", admin.isPaymentAlerts(),
                        "darkMode", admin.isDarkMode()
                )
        );
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
    public Map<String, Object> changePassword(String email, ChangePasswordRequest request) {
        UserAccount admin = getAdmin(email);
        if (!passwordEncoder.matches(request.currentPassword(), admin.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password and confirm password must match");
        }
        admin.setPassword(passwordEncoder.encode(request.newPassword()));
        userAccountRepository.save(admin);
        return Map.of("changed", true);
    }

    @Transactional
    public Map<String, Object> updatePreferences(String email, NotificationPreferenceRequest request) {
        UserAccount admin = getAdmin(email);
        if (request.lowStockAlerts() != null) {
            admin.setLowStockAlerts(request.lowStockAlerts());
        }
        if (request.planExpiryAlerts() != null) {
            admin.setPlanExpiryAlerts(request.planExpiryAlerts());
        }
        if (request.paymentAlerts() != null) {
            admin.setPaymentAlerts(request.paymentAlerts());
        }
        if (request.darkMode() != null) {
            admin.setDarkMode(request.darkMode());
        }
        userAccountRepository.save(admin);
        return getSettings(email);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNotifications(String email) {
        UserAccount admin = getAdmin(email);
        return Map.of("items", mapNotifications(notificationRepository.findTop8ByUserIdOrderByCreatedAtDesc(admin.getId())));
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
        double stockRatio = product.getReorderThreshold() == 0 ? 100 : (product.getQuantity() / product.getReorderThreshold()) * 100;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", product.getId());
        data.put("name", product.getName());
        data.put("sku", product.getSku());
        data.put("price", product.getPrice());
        data.put("quantity", product.getQuantity());
        data.put("reorderThreshold", product.getReorderThreshold());
        data.put("unit", product.getUnit());
        data.put("active", product.isActive());
        data.put("stockHealth", Math.round(stockRatio));
        data.put("lowStock", product.getQuantity() <= product.getReorderThreshold());
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

    private List<Map<String, Object>> buildTopSales(List<Product> products) {
        return products.stream()
                .sorted(Comparator.comparing(Product::getPrice).reversed())
                .limit(5)
                .map(this::topSaleItem)
                .toList();
    }

    private List<Map<String, Object>> mapNotifications(List<Notification> notifications) {
        return notifications.stream()
                .map(this::notificationItem)
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

    private Map<String, Object> topSaleItem(Product product) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", product.getName());
        data.put("value", Math.max(10, Math.round(product.getPrice().doubleValue() * 2)));
        data.put("unit", product.getUnit());
        return data;
    }

    private Map<String, Object> notificationItem(Notification notification) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", notification.getId());
        data.put("title", notification.getTitle());
        data.put("message", notification.getMessage());
        data.put("type", notification.getType());
        data.put("createdAt", notification.getCreatedAt());
        return data;
    }

    private Map<String, Object> metric(String label, String value, String helper, String accent) {
        return Map.of("label", label, "value", value, "helper", helper, "accent", accent);
    }

    private void createNotification(UserAccount admin, String title, String message, NotificationType type) {
        notificationRepository.save(Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(admin)
                .build());
    }
}
