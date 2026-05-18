package com.myreport.backend.service;

import com.myreport.backend.dto.auth.LoginRequest;
import com.myreport.backend.dto.auth.ForgotPasswordRequest;
import com.myreport.backend.dto.auth.OtpVerificationRequest;
import com.myreport.backend.dto.auth.RegisterRequest;
import com.myreport.backend.dto.auth.ResetPasswordRequest;
import com.myreport.backend.dto.auth.SignupRequest;
import com.myreport.backend.entity.Notification;
import com.myreport.backend.entity.PasswordResetToken;
import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.Store;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.NotificationType;
import com.myreport.backend.entity.enums.PlanStatus;
import com.myreport.backend.entity.enums.Role;
import com.myreport.backend.entity.enums.StoreStatus;
import com.myreport.backend.entity.enums.UserStatus;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.NotificationRepository;
import com.myreport.backend.repository.PasswordResetTokenRepository;
import com.myreport.backend.repository.PlanRepository;
import com.myreport.backend.repository.StoreRepository;
import com.myreport.backend.repository.UserAccountRepository;
import com.myreport.backend.security.JwtService;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private static final String DEMO_OTP = "654321";

    private final UserAccountRepository userAccountRepository;
    private final StoreRepository storeRepository;
    private final PlanRepository planRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PlanDateService planDateService;
    private final StoreCodeService storeCodeService;

    @Value("${app.frontend-origin}")
    private String frontendOrigin;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Transactional(readOnly = true)
    public Map<String, Object> login(LoginRequest request) {
        UserAccount user = resolveLoginUser(request.email().trim(), request.role());

        if (user.getRole() != request.role()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Selected role does not match this account");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login ID or password");
        }

        if (user.getRole() == Role.ADMIN && !user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Verify your email with OTP before logging in");
        }

        if (user.getRole() == Role.ADMIN && user.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is pending SuperAdmin approval");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is currently blocked");
        }

        String token = jwtService.generateToken(user, Boolean.TRUE.equals(request.rememberMe()));
        return buildAuthPayload(user, token);
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        if (userAccountRepository.findByEmailIgnoreCase(request.admin().email()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists for this admin email");
        }

        if (!request.admin().password().equals(request.admin().confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password and confirm password must match");
        }

        Plan assignedPlan = planRepository.findById(request.planId())
                .filter(plan -> plan.getStatus() == PlanStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected plan is not available"));

        UserAccount admin = UserAccount.builder()
                .fullName(request.admin().fullName())
                .email(request.admin().email().toLowerCase())
                .mobileNumber(request.admin().mobile())
                .password(passwordEncoder.encode(request.admin().password()))
                .gender(request.admin().gender())
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .city(request.organization().city())
                .address(request.organization().address())
                .storeName(request.organization().organizationName())
                .avatarUrl(createAvatarUrl(request.admin().fullName()))
                .build();
        userAccountRepository.save(admin);

        LocalDate planStartedAt = LocalDate.now();
        Store store = Store.builder()
                .name(request.organization().organizationName())
                .storeCode(storeCodeService.generateUniqueStoreCode())
                .storeType(request.organization().storeType())
                .city(request.organization().city())
                .state(request.organization().state())
                .country(request.organization().country())
                .businessEmail(request.organization().businessEmail().toLowerCase())
                .phone(request.organization().phone())
                .address(request.organization().address())
                .status(StoreStatus.ACTIVE)
                .plan(assignedPlan)
                .planStartedAt(planStartedAt)
                .planExpiresAt(planDateService.calculateExpiry(assignedPlan, planStartedAt))
                .owner(admin)
                .build();
        storeRepository.save(store);

        String token = jwtService.generateToken(admin, true);
        sendRegistrationSuccessEmailSafely(admin, store, assignedPlan);
        return buildAuthPayload(admin, token);
    }

    @Transactional
    public Map<String, Object> signupAdmin(SignupRequest request) {
        if (userAccountRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists for this email");
        }

        if (!request.password().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password and confirm password must match");
        }

        Plan defaultPlan = planRepository.findFirstByStatusOrderByMonthlyPriceAsc(PlanStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "No active plan is configured yet"));

        UserAccount admin = UserAccount.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .mobileNumber(request.mobileNumber())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.ADMIN)
                .status(UserStatus.PENDING_APPROVAL)
                .emailVerified(DEMO_OTP.equals(request.otp()))
                .city(request.city())
                .address(request.address())
                .storeName(request.storeName())
                .avatarUrl(createAvatarUrl(request.fullName()))
                .build();
        userAccountRepository.save(admin);

        LocalDate planStartedAt = LocalDate.now();
        Store store = Store.builder()
                .name(request.storeName())
                .storeCode(storeCodeService.generateUniqueStoreCode())
                .storeType("Grocery Shop")
                .city(request.city())
                .address(request.address())
                .status(StoreStatus.PENDING)
                .plan(defaultPlan)
                .planStartedAt(planStartedAt)
                .planExpiresAt(planDateService.calculateExpiry(defaultPlan, planStartedAt))
                .owner(admin)
                .build();
        storeRepository.save(store);

        createSuperAdminNotifications(
                "New signup request",
                request.fullName() + " registered " + request.storeName() + " and is waiting for approval",
                NotificationType.SIGNUP_APPROVAL);
        sendRegistrationSuccessEmailSafely(admin, store, defaultPlan);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("email", admin.getEmail());
        data.put("storeCode", store.getStoreCode());
        data.put("status", admin.getStatus());
        data.put("emailVerified", admin.isEmailVerified());
        data.put("pendingApproval", true);
        data.put("demoOtp", DEMO_OTP);
        data.put("message",
                admin.isEmailVerified()
                        ? "Signup completed. Your account is now waiting for SuperAdmin approval."
                        : "Signup saved. Verify the demo OTP to finish email verification.");
        return data;
    }

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Email not registered"));

        passwordResetTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        passwordResetTokenRepository.deleteAll(passwordResetTokenRepository.findAll().stream()
                .filter(token -> token.getUser().getId().equals(user.getId()) && !token.isUsed())
                .toList());

        String tokenValue = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenValue)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .user(user)
                .build();
        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendBaseUrl() + "/reset-password?token=" + tokenValue;
        sendResetPasswordEmailSafely(user.getEmail(), resetLink);

        return Map.of("message", "Reset link sent to your email.");
    }

    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        UserAccount user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.password()));
        userAccountRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return Map.of("message", "Password updated successfully");
    }

    @Transactional
    public Map<String, Object> verifyOtp(OtpVerificationRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        if (!DEMO_OTP.equals(request.otp())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP. Use the demo OTP from the signup flow");
        }

        user.setEmailVerified(true);
        userAccountRepository.save(user);

        return Map.of(
                "email", user.getEmail(),
                "verified", true,
                "message", "OTP verified successfully. Your account now awaits approval.");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> me(String email) {
        UserAccount user = getRequiredUser(email);
        return buildAuthPayload(user, null);
    }

    private Map<String, Object> buildAuthPayload(UserAccount user, String token) {
        Store store = storeRepository.findByOwnerId(user.getId()).orElse(null);
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("mobileNumber", user.getMobileNumber());
        profile.put("role", user.getRole());
        profile.put("status", user.getStatus());
        profile.put("city", user.getCity());
        profile.put("address", user.getAddress());
        profile.put("storeName", user.getStoreName());
        profile.put("avatarUrl", user.getAvatarUrl());
        profile.put("preferences", Map.of(
                "lowStockAlerts", user.isLowStockAlerts(),
                "planExpiryAlerts", user.isPlanExpiryAlerts(),
                "paymentAlerts", user.isPaymentAlerts(),
                "darkMode", user.isDarkMode()));

        if (store != null) {
            Map<String, Object> storeData = new LinkedHashMap<>();
            storeData.put("id", store.getId());
            storeData.put("storeCode", store.getStoreCode());
            storeData.put("name", store.getName());
            storeData.put("status", store.getStatus());
            storeData.put("city", store.getCity());
            storeData.put("planExpiresAt", store.getPlanExpiresAt());
            storeData.put("planName", store.getPlan() != null ? store.getPlan().getName() : null);
            profile.put("store", storeData);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("redirectTo", user.getRole() == Role.SUPER_ADMIN ? "/superadmin/dashboard" : "/admin/dashboard");
        response.put("profile", profile);
        return response;
    }

    private UserAccount getRequiredUser(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserAccount resolveLoginUser(String identifier, Role role) {
        if (role == Role.ADMIN && !identifier.contains("@")) {
            Store store = storeRepository.findByStoreCodeIgnoreCase(identifier)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login ID or password"));

            if (store.getOwner() == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login ID or password");
            }

            return store.getOwner();
        }

        return userAccountRepository.findByEmailIgnoreCase(identifier)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login ID or password"));
    }

    private void createSuperAdminNotifications(String title, String message, NotificationType type) {
        List<UserAccount> superAdmins = userAccountRepository.findByRole(Role.SUPER_ADMIN);
        for (UserAccount superAdmin : superAdmins) {
            notificationRepository.save(Notification.builder()
                    .title(title)
                    .message(message)
                    .type(type)
                    .user(superAdmin)
                    .build());
        }
    }

    private void sendRegistrationSuccessEmailSafely(UserAccount admin, Store store, Plan plan) {
        try {
            String loginLink = publicFrontendLoginLink();
            String storeName = store != null && store.getName() != null ? store.getName() : admin.getStoreName();
            String storeCode = store != null && store.getStoreCode() != null ? store.getStoreCode() : "Will be shared soon";
            String planName = plan != null && plan.getName() != null ? plan.getName() : "Your selected plan";
            String statusMessage = admin.getStatus() == UserStatus.PENDING_APPROVAL
                    ? "Pending approval by the MyReport administrator"
                    : "Active";
            String plainBody = registrationPlainText(admin.getFullName(), admin.getEmail(), storeName, storeCode, planName, statusMessage, loginLink);

            String subject = "MyReport account details";
            String htmlBody = registrationEmailHtml(admin.getFullName(), admin.getEmail(), storeName, storeCode, planName, statusMessage, loginLink);
            for (String recipient : registrationEmailRecipients(admin, store)) {
                sendRegistrationEmailToRecipient(recipient, subject, plainBody, htmlBody);
            }
        } catch (Exception exception) {
            log.warn("Registration success email could not be prepared for {}", admin.getEmail(), exception);
        }
    }

    private List<String> registrationEmailRecipients(UserAccount admin, Store store) {
        List<String> recipients = new ArrayList<>();
        addEmailRecipient(recipients, admin.getEmail());
        if (store != null) {
            addEmailRecipient(recipients, store.getBusinessEmail());
        }
        return recipients;
    }

    private void addEmailRecipient(List<String> recipients, String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (!recipients.contains(normalizedEmail)) {
            recipients.add(normalizedEmail);
        }
    }

    private void sendRegistrationEmailToRecipient(String recipient, String subject, String plainBody, String htmlBody) {
        try {
            emailService.sendHtmlEmail(recipient, subject, plainBody, htmlBody);
            log.info("Registration success email sent to {}", recipient);
        } catch (Exception htmlException) {
            log.warn("HTML registration email could not be sent to {}. Trying plain text fallback.", recipient, htmlException);
            try {
                emailService.sendEmail(recipient, subject, plainBody);
                log.info("Plain registration success email sent to {}", recipient);
            } catch (Exception plainException) {
                log.warn("Registration success email could not be sent to {}", recipient, plainException);
            }
        }
    }

    private void sendResetPasswordEmailSafely(String email, String resetLink) {
        try {
            String plainBody = "Click below link to reset password:\n"
                    + resetLink
                    + "\n\nThis link expires in 15 minutes.";
            emailService.sendHtmlEmail(
                    email,
                    "Reset Your MyReport Password",
                    plainBody,
                    resetPasswordEmailHtml(resetLink));
        } catch (Exception exception) {
            log.warn("Reset password email could not be sent to {}: {}", email, exception.getMessage());
        }
    }

    private String registrationEmailHtml(String fullName, String adminEmail, String storeName, String storeCode, String planName, String statusMessage, String loginLink) {
        String loginHelp = hasText(loginLink)
                ? "Use either the Email ID or Store ID below when signing in."
                : "Use either the Email ID or Store ID below when the MyReport login page is available.";
        String loginAction = hasText(loginLink)
                ? ctaButton("Open MyReport", loginLink)
                : "<p style=\"margin:0 0 22px;color:#4b5563;font-size:14px;line-height:1.6;\">The login page will be available from your MyReport workspace URL.</p>";

        return emailShell(
                "Account Information",
                "Your MyReport account details",
                "Hello " + fullName + ", your MyReport account has been created. Please keep these details for your records.",
                detailPanel(
                        "Account Details",
                        loginHelp,
                        detailRow("Store ID", storeCode)
                                + detailRow("Email ID", adminEmail)
                                + detailRow("Store Name", storeName)
                                + detailRow("Plan", planName)
                                + detailRow("Status", statusMessage))
                        + "<p style=\"margin:0 0 22px;color:#4b5563;font-size:14px;line-height:1.6;\">If any detail looks incorrect, contact MyReport support or reply to this email.</p>"
                        + loginAction);
    }

    private String registrationPlainText(String fullName, String adminEmail, String storeName, String storeCode, String planName, String statusMessage, String loginLink) {
        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(fullName).append(",\n\n")
                .append("Your MyReport account has been created. Please keep these details for your records.\n\n")
                .append("Account Details\n")
                .append("Store Name: ").append(storeName).append("\n")
                .append("Store ID: ").append(storeCode).append("\n")
                .append("Email ID: ").append(adminEmail).append("\n")
                .append("Plan: ").append(planName).append("\n")
                .append("Status: ").append(statusMessage).append("\n\n")
                .append("You can sign in using either your Email ID or Store ID.\n");

        if (hasText(loginLink)) {
            body.append("MyReport login page:\n").append(loginLink).append("\n\n");
        } else {
            body.append("The login page will be available from your MyReport workspace URL.\n\n");
        }

        body.append("If any detail looks incorrect, contact MyReport support or reply to this email.\n\n")
                .append("Regards,\n")
                .append("MyReport Team");
        return body.toString();
    }

    private String resetPasswordEmailHtml(String resetLink) {
        return emailShell(
                "Password Reset",
                "Reset your MyReport password",
                "We received a password reset request for your account. This secure link expires in 15 minutes.",
                detailPanel(
                        "Security Details",
                        "Use the button below to create a new password.",
                        detailRow("Request", "Password reset")
                                + detailRow("Expiry", "15 minutes"))
                        + ctaButton("Reset Password", resetLink)
                        + "<p style=\"margin:22px 0 0;color:#6b5b8a;font-size:13px;line-height:1.6;\">If you did not request this, you can safely ignore this email.</p>");
    }

    private String emailShell(String eyebrow, String title, String intro, String body) {
        return "<!doctype html><html><body style=\"margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f6f7fb;padding:28px 12px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;\">"
                + "<tr><td style=\"padding:28px 32px 18px;border-bottom:1px solid #e5e7eb;\">"
                + "<div style=\"font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#4f46e5;\">" + escapeHtml(eyebrow) + "</div>"
                + "<div style=\"margin-top:10px;font-size:24px;line-height:1.25;font-weight:700;color:#111827;\">" + escapeHtml(title) + "</div>"
                + "<div style=\"margin-top:10px;max-width:520px;color:#4b5563;font-size:14px;line-height:1.6;\">" + escapeHtml(intro) + "</div>"
                + "</td></tr>"
                + "<tr><td style=\"padding:26px 32px;background:#ffffff;\">"
                + body
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:28px;border-top:1px solid #e5e7eb;\">"
                + "<tr><td style=\"padding-top:16px;color:#6b7280;font-size:12px;line-height:1.6;\">Regards,<br><strong style=\"color:#111827;\">MyReport Team</strong></td></tr>"
                + "</table>"
                + "</td></tr></table>"
                + "</td></tr></table></body></html>";
    }

    private String detailPanel(String title, String subtitle, String rows) {
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 22px;border-radius:10px;background:#f9fafb;border:1px solid #e5e7eb;\">"
                + "<tr><td style=\"padding:18px 18px 6px;\">"
                + "<div style=\"font-size:13px;font-weight:700;color:#111827;\">" + escapeHtml(title) + "</div>"
                + "<div style=\"margin-top:6px;color:#6b7280;font-size:13px;line-height:1.5;\">" + escapeHtml(subtitle) + "</div>"
                + "</td></tr>"
                + "<tr><td style=\"padding:2px 18px 16px;\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"
                + rows
                + "</table>"
                + "</td></tr></table>";
    }

    private String detailRow(String label, String value) {
        return "<tr>"
                + "<td style=\"width:150px;padding:11px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;font-weight:700;\">" + escapeHtml(label) + "</td>"
                + "<td align=\"right\" style=\"padding:11px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:700;\">" + escapeHtml(value) + "</td>"
                + "</tr>";
    }

    private String ctaButton(String label, String href) {
        String safeHref = escapeHtml(href);
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:6px;\"><tr><td style=\"border-radius:8px;background:#4f46e5;\">"
                + "<a href=\"" + safeHref + "\" style=\"display:inline-block;border-radius:8px;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 18px;\">"
                + escapeHtml(label)
                + "</a></td></tr></table>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String createAvatarUrl(String fullName) {
        return "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=" + fullName.replace(" ", "+");
    }

    private String frontendBaseUrl() {
        if (frontendOrigin == null || frontendOrigin.isBlank()) {
            return "http://localhost:3000";
        }

        String[] origins = frontendOrigin.split(",");
        for (String origin : origins) {
            String value = origin.trim().replaceAll("/$", "");
            if (value.equals("http://localhost:3000") || value.equals("http://127.0.0.1:3000")) {
                return value;
            }
        }

        String firstOrigin = origins[0].trim().replaceAll("/$", "");
        if (firstOrigin.equals("http://localhost:5173") || firstOrigin.equals("http://127.0.0.1:5173")) {
            return firstOrigin.replace(":5173", ":3000");
        }
        return firstOrigin.isBlank() ? "http://localhost:3000" : firstOrigin;
    }

    private String publicFrontendLoginLink() {
        String baseUrl = frontendBaseUrl();
        if (!isPublicHttpsUrl(baseUrl)) {
            return null;
        }
        return baseUrl + "/login";
    }

    private boolean isPublicHttpsUrl(String value) {
        if (!hasText(value)) {
            return false;
        }

        String normalized = value.trim().toLowerCase();
        return normalized.startsWith("https://")
                && !normalized.contains("localhost")
                && !normalized.contains("127.0.0.1")
                && !normalized.contains("0.0.0.0");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

}
