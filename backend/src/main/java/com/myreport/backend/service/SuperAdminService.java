package com.myreport.backend.service;

import com.myreport.backend.dto.superadmin.AdminRequest;
import com.myreport.backend.dto.superadmin.PlanRequest;
import com.myreport.backend.entity.Invoice;
import com.myreport.backend.entity.Notification;
import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.Store;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.NotificationType;
import com.myreport.backend.entity.enums.PlanStatus;
import com.myreport.backend.entity.enums.Role;
import com.myreport.backend.entity.enums.StoreStatus;
import com.myreport.backend.entity.enums.UserStatus;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.InvoiceRepository;
import com.myreport.backend.repository.NotificationRepository;
import com.myreport.backend.repository.PlanRepository;
import com.myreport.backend.repository.StoreRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserAccountRepository userAccountRepository;
    private final StoreRepository storeRepository;
    private final PlanRepository planRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String email) {
        UserAccount superAdmin = getUser(email, Role.SUPER_ADMIN);
        List<UserAccount> admins = userAccountRepository.findAllByRoleOrderByCreatedAtDesc(Role.ADMIN);
        List<Store> stores = storeRepository.findAllByOrderByCreatedAtDesc();
        List<Plan> plans = planRepository.findAllByOrderByCreatedAtDesc();
        List<Invoice> invoices = invoiceRepository.findAllByOrderByCreatedAtDesc();

        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> metrics = List.of(
                metric("Total Admins", String.valueOf(admins.size()), admins.stream().filter(a -> a.getStatus() == UserStatus.ACTIVE).count() + " active", "cyan"),
                metric("Total Stores", String.valueOf(stores.size()), stores.stream().filter(s -> s.getStatus() == StoreStatus.ACTIVE).count() + " live", "emerald"),
                metric("Total Revenue", "Rs. " + totalRevenue.setScale(0, RoundingMode.HALF_UP), "Across all invoices", "amber"),
                metric("Active Plans", String.valueOf(plans.stream().filter(p -> p.getStatus() == PlanStatus.ACTIVE).count()), "Subscription catalog", "violet")
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("metrics", metrics);
        data.put("revenueSeries", buildMonthlySeries(invoices));
        data.put("growthSeries", buildGrowthSeries(admins, stores));
        data.put("recentActivities", buildRecentActivities(admins, stores));
        data.put("expiringPlans", buildExpiringPlans());
        data.put("notifications", mapNotifications(notificationRepository.findTop8ByUserIdOrderByCreatedAtDesc(superAdmin.getId())));
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdmins() {
        List<UserAccount> admins = userAccountRepository.findAllByRoleOrderByCreatedAtDesc(Role.ADMIN);
        List<Map<String, Object>> items = admins.stream()
                .map(this::mapAdmin)
                .toList();
        return Map.of("items", items, "total", items.size());
    }

    @Transactional
    public Map<String, Object> createAdmin(AdminRequest request) {
        if (userAccountRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Admin account already exists");
        }

        Plan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));

        UserAccount admin = UserAccount.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .mobileNumber(request.mobileNumber())
                .password(passwordEncoder.encode(
                        request.password() == null || request.password().isBlank() ? "Admin@12345" : request.password()
                ))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .city(request.city())
                .address(request.address())
                .storeName(request.storeName())
                .avatarUrl(createAvatarUrl(request.fullName()))
                .build();
        userAccountRepository.save(admin);

        Store store = Store.builder()
                .name(request.storeName())
                .storeType("Grocery Shop")
                .city(request.city())
                .address(request.address())
                .status(StoreStatus.ACTIVE)
                .owner(admin)
                .plan(plan)
                .planExpiresAt(LocalDate.now().plusDays(30))
                .build();
        storeRepository.save(store);

        notificationRepository.save(Notification.builder()
                .title("Welcome to MyReport")
                .message("Your workspace has been provisioned and is ready to use.")
                .type(NotificationType.PAYMENT_SUCCESS)
                .user(admin)
                .build());

        return mapAdmin(admin);
    }

    @Transactional
    public Map<String, Object> updateAdmin(Long adminId, AdminRequest request) {
        UserAccount admin = getAdmin(adminId);
        userAccountRepository.findByEmailIgnoreCase(request.email())
                .filter(existing -> !existing.getId().equals(adminId))
                .ifPresent(existing -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Another account already uses this email");
                });
        Plan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
        Store store = storeRepository.findByOwnerId(admin.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found"));

        admin.setFullName(request.fullName());
        admin.setEmail(request.email().toLowerCase());
        admin.setMobileNumber(request.mobileNumber());
        admin.setCity(request.city());
        admin.setAddress(request.address());
        admin.setStoreName(request.storeName());
        if (request.password() != null && !request.password().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.password()));
        }

        store.setName(request.storeName());
        store.setCity(request.city());
        store.setAddress(request.address());
        store.setPlan(plan);
        storeRepository.save(store);
        userAccountRepository.save(admin);
        return mapAdmin(admin);
    }

    @Transactional
    public Map<String, Object> approveAdmin(Long adminId) {
        UserAccount admin = getAdmin(adminId);
        Store store = storeRepository.findByOwnerId(admin.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found"));
        admin.setStatus(UserStatus.ACTIVE);
        admin.setEmailVerified(true);
        store.setStatus(StoreStatus.ACTIVE);
        userAccountRepository.save(admin);
        storeRepository.save(store);
        notificationRepository.save(Notification.builder()
                .title("Signup approved")
                .message("Your MyReport workspace was approved by the SuperAdmin.")
                .type(NotificationType.SIGNUP_APPROVAL)
                .user(admin)
                .build());
        return mapAdmin(admin);
    }

    @Transactional
    public Map<String, Object> toggleAdminStatus(Long adminId) {
        UserAccount admin = getAdmin(adminId);
        Store store = storeRepository.findByOwnerId(admin.getId()).orElse(null);

        if (admin.getStatus() == UserStatus.BLOCKED) {
            admin.setStatus(UserStatus.ACTIVE);
            if (store != null) {
                store.setStatus(StoreStatus.ACTIVE);
                storeRepository.save(store);
            }
        } else {
            admin.setStatus(UserStatus.BLOCKED);
            if (store != null) {
                store.setStatus(StoreStatus.SUSPENDED);
                storeRepository.save(store);
            }
        }

        userAccountRepository.save(admin);
        return mapAdmin(admin);
    }

    @Transactional
    public void deleteAdmin(Long adminId) {
        UserAccount admin = getAdmin(adminId);
        storeRepository.findByOwnerId(admin.getId()).ifPresent(storeRepository::delete);
        userAccountRepository.delete(admin);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStores(String storeType) {
        List<Map<String, Object>> items = (storeType == null || storeType.isBlank()
                ? storeRepository.findAllByOrderByCreatedAtDesc()
                : storeRepository.findAllByStoreTypeIgnoreCaseOrderByCreatedAtDesc(storeType))
                .stream()
                .map(store -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", store.getId());
                    data.put("name", store.getName());
                    data.put("storeType", store.getStoreType());
                    data.put("city", store.getCity());
                    data.put("status", store.getStatus());
                    data.put("plan", store.getPlan() != null ? store.getPlan().getName() : null);
                    data.put("planExpiresAt", store.getPlanExpiresAt());
                    data.put("owner", store.getOwner() != null ? store.getOwner().getFullName() : null);
                    data.put("ownerEmail", store.getOwner() != null ? store.getOwner().getEmail() : null);
                    return data;
                })
                .toList();
        return Map.of("items", items);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlans() {
        List<Map<String, Object>> items = planRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapPlan)
                .toList();
        return Map.of("items", items);
    }

    @Transactional
    public Map<String, Object> createPlan(PlanRequest request) {
        Plan plan = Plan.builder()
                .name(request.name())
                .description(request.description())
                .monthlyPrice(request.monthlyPrice())
                .yearlyPrice(request.yearlyPrice())
                .maxProducts(request.maxProducts())
                .maxCustomers(request.maxCustomers())
                .features(request.features())
                .status(request.status())
                .build();
        planRepository.save(plan);
        return mapPlan(plan);
    }

    @Transactional
    public Map<String, Object> updatePlan(Long planId, PlanRequest request) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));

        plan.setName(request.name());
        plan.setDescription(request.description());
        plan.setMonthlyPrice(request.monthlyPrice());
        plan.setYearlyPrice(request.yearlyPrice());
        plan.setMaxProducts(request.maxProducts());
        plan.setMaxCustomers(request.maxCustomers());
        plan.setFeatures(request.features());
        plan.setStatus(request.status());
        planRepository.save(plan);
        return mapPlan(plan);
    }

    @Transactional
    public Map<String, Object> togglePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
        plan.setStatus(plan.getStatus() == PlanStatus.ACTIVE ? PlanStatus.INACTIVE : PlanStatus.ACTIVE);
        planRepository.save(plan);
        return mapPlan(plan);
    }

    @Transactional
    public void deletePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
        if (!plan.getStores().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This plan is already assigned to one or more stores");
        }
        planRepository.delete(plan);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInvoices() {
        List<Map<String, Object>> items = invoiceRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(25)
                .map(invoice -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", invoice.getId());
                    data.put("invoiceNumber", invoice.getInvoiceNumber());
                    data.put("customerName", invoice.getCustomerName());
                    data.put("totalAmount", invoice.getTotalAmount());
                    data.put("status", invoice.getStatus());
                    data.put("store", invoice.getStore() != null ? invoice.getStore().getName() : null);
                    data.put("createdAt", invoice.getCreatedAt());
                    return data;
                })
                .toList();
        return Map.of("items", items);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReports() {
        List<Invoice> invoices = invoiceRepository.findAllByOrderByCreatedAtDesc();
        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "summary", Map.of(
                        "revenue", totalRevenue,
                        "stores", storeRepository.count(),
                        "admins", userAccountRepository.countByRole(Role.ADMIN)
                ),
                "monthly", buildMonthlySeries(invoices),
                "planMix", planRepository.findAllByOrderByCreatedAtDesc().stream()
                        .map(plan -> Map.of(
                                "name", plan.getName(),
                                "stores", plan.getStores().size(),
                                "status", plan.getStatus()
                        ))
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings(String email) {
        UserAccount user = getUser(email, Role.SUPER_ADMIN);
        return Map.of(
                "profile", Map.of(
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "mobileNumber", user.getMobileNumber(),
                        "avatarUrl", user.getAvatarUrl()
                )
        );
    }

    private UserAccount getUser(String email, Role role) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() != role) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return user;
    }

    private UserAccount getAdmin(Long adminId) {
        UserAccount user = userAccountRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Requested account is not an admin");
        }
        return user;
    }

    private Map<String, Object> mapAdmin(UserAccount admin) {
        Store store = storeRepository.findByOwnerId(admin.getId()).orElse(null);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", admin.getId());
        data.put("fullName", admin.getFullName());
        data.put("email", admin.getEmail());
        data.put("mobileNumber", admin.getMobileNumber());
        data.put("status", admin.getStatus());
        data.put("emailVerified", admin.isEmailVerified());
        data.put("storeName", store != null ? store.getName() : admin.getStoreName());
        data.put("city", admin.getCity());
        data.put("plan", store != null && store.getPlan() != null ? store.getPlan().getName() : null);
        data.put("planExpiresAt", store != null ? store.getPlanExpiresAt() : null);
        data.put("createdAt", admin.getCreatedAt());
        return data;
    }

    private Map<String, Object> mapPlan(Plan plan) {
        return Map.of(
                "id", plan.getId(),
                "name", plan.getName(),
                "description", plan.getDescription(),
                "monthlyPrice", plan.getMonthlyPrice(),
                "yearlyPrice", plan.getYearlyPrice(),
                "maxProducts", plan.getMaxProducts(),
                "maxCustomers", plan.getMaxCustomers(),
                "features", plan.getFeatures(),
                "status", plan.getStatus()
        );
    }

    private List<Map<String, Object>> buildMonthlySeries(List<Invoice> invoices) {
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

    private List<Map<String, Object>> buildGrowthSeries(List<UserAccount> admins, List<Store> stores) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        List<Map<String, Object>> series = new ArrayList<>();
        for (int index = 5; index >= 0; index--) {
            YearMonth month = YearMonth.from(today.minusMonths(index));
            long adminCount = admins.stream()
                    .filter(admin -> YearMonth.from(admin.getCreatedAt()).equals(month))
                    .count();
            long storeCount = stores.stream()
                    .filter(store -> YearMonth.from(store.getCreatedAt()).equals(month))
                    .count();
            series.add(growthPoint(formatter.format(month.atDay(1)), adminCount, storeCount));
        }
        return series;
    }

    private List<Map<String, Object>> buildRecentActivities(List<UserAccount> admins, List<Store> stores) {
        List<Map<String, Object>> activities = new ArrayList<>();
        admins.stream()
                .sorted(Comparator.comparing(UserAccount::getCreatedAt).reversed())
                .limit(3)
                .forEach(admin -> activities.add(activityItem(
                        admin.getFullName() + " onboarded",
                        admin.getStoreName() + " joined the platform",
                        admin.getCreatedAt()
                )));
        stores.stream()
                .sorted(Comparator.comparing(Store::getPlanExpiresAt))
                .limit(3)
                .forEach(store -> activities.add(activityItem(
                        store.getName() + " plan nearing renewal",
                        "Renews on " + store.getPlanExpiresAt(),
                        store.getUpdatedAt()
                )));
        return activities.stream()
                .sorted((left, right) -> ((LocalDateTime) right.get("timestamp")).compareTo((LocalDateTime) left.get("timestamp")))
                .limit(6)
                .toList();
    }

    private List<Map<String, Object>> buildExpiringPlans() {
        return storeRepository.findByPlanExpiresAtBetween(LocalDate.now(), LocalDate.now().plusDays(45)).stream()
                .map(this::expiringPlanItem)
                .toList();
    }

    private List<Map<String, Object>> mapNotifications(List<Notification> notifications) {
        return notifications.stream()
                .map(this::notificationItem)
                .collect(Collectors.toList());
    }

    private Map<String, Object> seriesPoint(String label, BigDecimal value) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("label", label);
        data.put("value", value);
        return data;
    }

    private Map<String, Object> growthPoint(String label, long admins, long stores) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("label", label);
        data.put("admins", admins);
        data.put("stores", stores);
        return data;
    }

    private Map<String, Object> activityItem(String title, String subtitle, LocalDateTime timestamp) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("title", title);
        data.put("subtitle", subtitle);
        data.put("timestamp", timestamp);
        return data;
    }

    private Map<String, Object> expiringPlanItem(Store store) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("storeName", store.getName());
        data.put("plan", store.getPlan() != null ? store.getPlan().getName() : null);
        data.put("owner", store.getOwner() != null ? store.getOwner().getFullName() : null);
        data.put("planExpiresAt", store.getPlanExpiresAt());
        return data;
    }

    private Map<String, Object> notificationItem(Notification notification) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("title", notification.getTitle());
        data.put("message", notification.getMessage());
        data.put("type", notification.getType());
        data.put("createdAt", notification.getCreatedAt());
        return data;
    }

    private Map<String, Object> metric(String label, String value, String helper, String accent) {
        return Map.of("label", label, "value", value, "helper", helper, "accent", accent);
    }

    private String createAvatarUrl(String fullName) {
        return "https://ui-avatars.com/api/?background=7C3AED&color=fff&name=" + fullName.replace(" ", "+");
    }
}
