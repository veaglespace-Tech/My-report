package com.myreport.backend.config;

import com.myreport.backend.entity.Customer;
import com.myreport.backend.entity.Invoice;
import com.myreport.backend.entity.Notification;
import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.Product;
import com.myreport.backend.entity.Store;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.InvoiceStatus;
import com.myreport.backend.entity.enums.NotificationType;
import com.myreport.backend.entity.enums.PlanStatus;
import com.myreport.backend.entity.enums.ProductUnit;
import com.myreport.backend.entity.enums.Role;
import com.myreport.backend.entity.enums.StoreStatus;
import com.myreport.backend.entity.enums.UserStatus;
import com.myreport.backend.repository.CustomerRepository;
import com.myreport.backend.repository.InvoiceRepository;
import com.myreport.backend.repository.NotificationRepository;
import com.myreport.backend.repository.PlanRepository;
import com.myreport.backend.repository.ProductRepository;
import com.myreport.backend.repository.StoreRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final PlanRepository planRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Value("${app.super-admin.password}")
    private String superAdminPassword;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        if (planRepository.count() == 0) {
            seedPlans();
        }
        if (userAccountRepository.countByRole(Role.ADMIN) == 0) {
            seedAdminWorkspaces();
        }
    }

    private void seedSuperAdmin() {
        userAccountRepository.findByEmailIgnoreCase(superAdminEmail).orElseGet(() -> {
            UserAccount superAdmin = UserAccount.builder()
                    .fullName("Ankita Patil")
                    .email(superAdminEmail)
                    .mobileNumber("9999999999")
                    .password(passwordEncoder.encode(superAdminPassword))
                    .role(Role.SUPER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .city("Pune")
                    .address("MyReport HQ")
                    .storeName("MyReport")
                    .avatarUrl("https://ui-avatars.com/api/?background=111827&color=fff&name=Ankita+Patil")
                    .build();
            return userAccountRepository.save(superAdmin);
        });
    }

    private void seedPlans() {
        planRepository.saveAll(List.of(
                Plan.builder()
                        .name("FREE TRIAL")
                        .description("7-day free trial to explore MyReport.")
                        .monthlyPrice(BigDecimal.ZERO)
                        .yearlyPrice(BigDecimal.ZERO)
                        .maxProducts(250)
                        .maxCustomers(1000)
                        .features("Starter workspace, Billing, Reports, Trial support")
                        .duration("7 Days")
                        .price(BigDecimal.ZERO)
                        .trialAvailable(true)
                        .status(PlanStatus.ACTIVE)
                        .build(),
                Plan.builder()
                        .name("Starter")
                        .description("Essential billing, customers, and sales reporting for growing stores.")
                        .monthlyPrice(new BigDecimal("1499"))
                        .yearlyPrice(new BigDecimal("14999"))
                        .maxProducts(250)
                        .maxCustomers(1000)
                        .features("POS Billing, GST invoices, Weekly reports, Email support")
                        .duration("1 Month")
                        .price(new BigDecimal("1499"))
                        .status(PlanStatus.ACTIVE)
                        .build(),
                Plan.builder()
                        .name("Growth")
                        .description("Advanced analytics, inventory intelligence, and multi-user workflows.")
                        .monthlyPrice(new BigDecimal("3499"))
                        .yearlyPrice(new BigDecimal("34999"))
                        .maxProducts(2000)
                        .maxCustomers(10000)
                        .features("Animated dashboards, Teams, Multi-export, Priority support")
                        .duration("6 Months")
                        .price(new BigDecimal("3499"))
                        .status(PlanStatus.ACTIVE)
                        .build(),
                Plan.builder()
                        .name("Enterprise")
                        .description("Custom workflows, SLAs, deeper visibility, and premium onboarding.")
                        .monthlyPrice(new BigDecimal("6999"))
                        .yearlyPrice(new BigDecimal("69999"))
                        .maxProducts(10000)
                        .maxCustomers(50000)
                        .features("Dedicated success, Custom roles, API access, SLA support")
                        .duration("12 Months")
                        .price(new BigDecimal("6999"))
                        .status(PlanStatus.ACTIVE)
                        .build()
        ));
    }

    private void seedAdminWorkspaces() {
        Plan starter = planRepository.findAll().stream().filter(plan -> "Starter".equals(plan.getName())).findFirst().orElseThrow();
        Plan growth = planRepository.findAll().stream().filter(plan -> "Growth".equals(plan.getName())).findFirst().orElseThrow();

        UserAccount approvedAdmin = userAccountRepository.save(UserAccount.builder()
                .fullName("Neha Sharma")
                .email("admin@myreport.com")
                .mobileNumber("9876543210")
                .password(passwordEncoder.encode("Admin@12345"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .city("Mumbai")
                .address("Bandra West, Mumbai")
                .storeName("GlowMart")
                .avatarUrl("https://ui-avatars.com/api/?background=2563EB&color=fff&name=Neha+Sharma")
                .build());
        approvedAdmin.setCreatedAt(LocalDateTime.now().minusMonths(4));
        approvedAdmin.setUpdatedAt(LocalDateTime.now().minusDays(3));
        approvedAdmin = userAccountRepository.save(approvedAdmin);

        UserAccount pendingAdmin = userAccountRepository.save(UserAccount.builder()
                .fullName("Arjun Mehta")
                .email("pending@myreport.com")
                .mobileNumber("9123456780")
                .password(passwordEncoder.encode("Admin@12345"))
                .role(Role.ADMIN)
                .status(UserStatus.PENDING_APPROVAL)
                .emailVerified(true)
                .city("Ahmedabad")
                .address("Satellite Road, Ahmedabad")
                .storeName("Urban Basket")
                .avatarUrl("https://ui-avatars.com/api/?background=059669&color=fff&name=Arjun+Mehta")
                .build());
        pendingAdmin.setCreatedAt(LocalDateTime.now().minusDays(3));
        pendingAdmin.setUpdatedAt(LocalDateTime.now().minusDays(1));
        pendingAdmin = userAccountRepository.save(pendingAdmin);

        UserAccount secondAdmin = userAccountRepository.save(UserAccount.builder()
                .fullName("Riya Kapoor")
                .email("riya@myreport.com")
                .mobileNumber("9001100220")
                .password(passwordEncoder.encode("Admin@12345"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .city("Bengaluru")
                .address("Indiranagar, Bengaluru")
                .storeName("Craft Avenue")
                .avatarUrl("https://ui-avatars.com/api/?background=7C3AED&color=fff&name=Riya+Kapoor")
                .build());
        secondAdmin.setCreatedAt(LocalDateTime.now().minusMonths(2));
        secondAdmin.setUpdatedAt(LocalDateTime.now().minusDays(5));
        secondAdmin = userAccountRepository.save(secondAdmin);

        Store approvedStore = storeRepository.save(Store.builder()
                .name("GlowMart")
                .storeType("Grocery Shop")
                .city("Mumbai")
                .address("Bandra West, Mumbai")
                .status(StoreStatus.ACTIVE)
                .plan(starter)
                .planExpiresAt(LocalDate.now().plusDays(18))
                .owner(approvedAdmin)
                .build());
        approvedStore.setCreatedAt(LocalDateTime.now().minusMonths(4));
        approvedStore.setUpdatedAt(LocalDateTime.now().minusDays(2));
        approvedStore = storeRepository.save(approvedStore);

        Store pendingStore = storeRepository.save(Store.builder()
                .name("Urban Basket")
                .storeType("Grocery Shop")
                .city("Ahmedabad")
                .address("Satellite Road, Ahmedabad")
                .status(StoreStatus.PENDING)
                .plan(starter)
                .planExpiresAt(LocalDate.now().plusDays(30))
                .owner(pendingAdmin)
                .build());
        pendingStore.setCreatedAt(LocalDateTime.now().minusDays(3));
        pendingStore.setUpdatedAt(LocalDateTime.now().minusDays(1));
        pendingStore = storeRepository.save(pendingStore);

        Store secondStore = storeRepository.save(Store.builder()
                .name("Craft Avenue")
                .storeType("Accessories Shop")
                .city("Bengaluru")
                .address("Indiranagar, Bengaluru")
                .status(StoreStatus.ACTIVE)
                .plan(growth)
                .planExpiresAt(LocalDate.now().plusDays(39))
                .owner(secondAdmin)
                .build());
        secondStore.setCreatedAt(LocalDateTime.now().minusMonths(2));
        secondStore.setUpdatedAt(LocalDateTime.now().minusDays(6));
        secondStore = storeRepository.save(secondStore);

        seedProducts(approvedStore);
        seedCustomers(approvedStore);
        seedInvoices(approvedStore);

        seedProducts(secondStore);
        seedCustomers(secondStore);
        seedInvoices(secondStore);

        notificationRepository.saveAll(List.of(
                buildNotification(approvedAdmin, "Low stock alert", "Arabica Beans stock dipped below the safe threshold.", NotificationType.LOW_STOCK, 1),
                buildNotification(approvedAdmin, "Payment success", "Invoice INV-20260429-01 was processed successfully.", NotificationType.PAYMENT_SUCCESS, 2),
                buildNotification(approvedAdmin, "Plan expiry", "Starter plan renews in 18 days.", NotificationType.PLAN_EXPIRY, 3),
                buildNotification(secondAdmin, "Payment success", "Growth plan invoice was captured successfully.", NotificationType.PAYMENT_SUCCESS, 1),
                buildNotification(userAccountRepository.findByEmailIgnoreCase(superAdminEmail).orElseThrow(),
                        "Signup approval", "Arjun Mehta is waiting for onboarding approval.", NotificationType.SIGNUP_APPROVAL, 1)
        ));
    }

    private void seedProducts(Store store) {
        List<Product> products = List.of(
                product(store, "Arabica Beans", "720", 18d, ProductUnit.KG, 5),
                product(store, "Cold Brew Bottles", "160", 44d, ProductUnit.PIECE, 4),
                product(store, "Signature Syrup", "540", 12d, ProductUnit.LITRE, 3),
                product(store, "Dessert Boxes", "220", 19d, ProductUnit.BOX, 2)
        );
        productRepository.saveAll(products);
    }

    private void seedCustomers(Store store) {
        List<Customer> customers = List.of(
                customer(store, "Aarav Desai", "aarav@example.com", "9011111111", "Mumbai", "32400", 12, 15),
                customer(store, "Meera Nair", "meera@example.com", "9022222222", "Mumbai", "17450", 7, 21),
                customer(store, "Kunal Jain", "kunal@example.com", "9033333333", "Pune", "21320", 9, 9)
        );
        customerRepository.saveAll(customers);
    }

    private void seedInvoices(Store store) {
        List<Invoice> invoices = List.of(
                invoice(store, store.getName() + "-INV-20260429-01", "Aarav Desai", "15400", 4),
                invoice(store, store.getName() + "-INV-20260410-02", "Meera Nair", "8450", 19),
                invoice(store, store.getName() + "-INV-20260317-03", "Kunal Jain", "12990", 43),
                invoice(store, store.getName() + "-INV-20260226-04", "Aarav Desai", "10650", 64),
                invoice(store, store.getName() + "-INV-20260115-05", "Retail Walk-in", "7250", 106),
                invoice(store, store.getName() + "-INV-20251212-06", "Corporate Desk", "18200", 138)
        );
        invoiceRepository.saveAll(invoices);
    }

    private Product product(Store store, String name, String price, double quantity, ProductUnit unit, int daysAgo) {
        Product product = Product.builder()
                .name(name)
                .price(new BigDecimal(price))
                .quantity(quantity)
                .unit(unit)
                .active(true)
                .store(store)
                .build();
        product.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        product.setUpdatedAt(LocalDateTime.now().minusDays(daysAgo / 2));
        return product;
    }

    private Customer customer(Store store, String fullName, String email, String mobileNumber, String city, String spent, int purchases, int daysAgo) {
        Customer customer = Customer.builder()
                .fullName(fullName)
                .email(email)
                .mobileNumber(mobileNumber)
                .city(city)
                .totalSpent(new BigDecimal(spent))
                .purchaseCount(purchases)
                .store(store)
                .build();
        customer.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        customer.setUpdatedAt(LocalDateTime.now().minusDays(daysAgo / 2));
        return customer;
    }

    private Invoice invoice(Store store, String invoiceNumber, String customerName, String total, int daysAgo) {
        BigDecimal subtotal = new BigDecimal(total);
        BigDecimal taxAmount = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customerName(customerName)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .discountAmount(new BigDecimal("250"))
                .totalAmount(subtotal.add(taxAmount).subtract(new BigDecimal("250")))
                .status(InvoiceStatus.PAID)
                .notes("Generated from seeded POS data")
                .store(store)
                .build();
        invoice.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        invoice.setUpdatedAt(LocalDateTime.now().minusDays(daysAgo));
        return invoice;
    }

    private Notification buildNotification(UserAccount user, String title, String message, NotificationType type, int daysAgo) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(user)
                .build();
        notification.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        notification.setUpdatedAt(LocalDateTime.now().minusDays(daysAgo));
        return notification;
    }
}
