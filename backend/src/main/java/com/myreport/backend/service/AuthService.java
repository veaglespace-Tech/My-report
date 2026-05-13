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

    @Value("${app.frontend-origin}")
    private String frontendOrigin;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Transactional(readOnly = true)
    public Map<String, Object> login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getRole() != request.role()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Selected role does not match this account");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
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

        Store store = Store.builder()
                .name(request.organization().organizationName())
                .storeType(request.organization().storeType())
                .city(request.organization().city())
                .state(request.organization().state())
                .country(request.organization().country())
                .businessEmail(request.organization().businessEmail().toLowerCase())
                .phone(request.organization().phone())
                .address(request.organization().address())
                .status(StoreStatus.ACTIVE)
                .plan(assignedPlan)
                .planExpiresAt(resolvePlanExpiry(assignedPlan))
                .owner(admin)
                .build();
        storeRepository.save(store);

        String token = jwtService.generateToken(admin, true);
        sendWelcomeEmailSafely(admin.getFullName(), admin.getEmail());
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

        Store store = Store.builder()
                .name(request.storeName())
                .storeType("Grocery Shop")
                .city(request.city())
                .address(request.address())
                .status(StoreStatus.PENDING)
                .plan(defaultPlan)
                .planExpiresAt(LocalDate.now().plusDays(30))
                .owner(admin)
                .build();
        storeRepository.save(store);

        createSuperAdminNotifications(
                "New signup request",
                request.fullName() + " registered " + request.storeName() + " and is waiting for approval",
                NotificationType.SIGNUP_APPROVAL);
        sendWelcomeEmailSafely(admin.getFullName(), admin.getEmail());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("email", admin.getEmail());
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

    private void sendWelcomeEmailSafely(String fullName, String email) {
        try {
            String loginLink = frontendBaseUrl() + "/login";
            emailService.sendEmail(
                    email,
                    "Welcome to MyReport Store",
                    "Hello " + fullName + ",\n\n"
                            + "Your account has been successfully registered with MyReport Store.\n\n"
                            + "You can now:\n"
                            + "- Manage billing\n"
                            + "- Track inventory\n"
                            + "- Generate invoices\n"
                            + "- View reports\n"
                            + "- Manage customers\n\n"
                            + "Login:\n" + loginLink + "\n\n"
                            + "Thank you,\nMyReport Team");
        } catch (Exception exception) {
            log.warn("Welcome email could not be sent to {}: {}", email, exception.getMessage());
        }
    }

    private void sendResetPasswordEmailSafely(String email, String resetLink) {
        try {
            emailService.sendEmail(
                    email,
                    "Reset Your MyReport Password",
                    "Click below link to reset password:\n"
                            + resetLink
                            + "\n\nThis link expires in 15 minutes.");
            System.out.println("Mail Method Called ... ");
        } catch (Exception exception) {
            log.warn("Reset password email could not be sent to {}: {}", email, exception.getMessage());
        }
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

    private LocalDate resolvePlanExpiry(Plan plan) {
        LocalDate now = LocalDate.now();
        if (plan != null && plan.isTrialAvailable()) {
            return now.plusDays(7);
        }
        String duration = plan != null ? plan.getDuration() : null;
        if (duration != null && !duration.isBlank()) {
            String normalized = duration.toLowerCase().trim();
            try {
                if (normalized.contains("year")) {
                    int years = Integer.parseInt(normalized.replaceAll("[^0-9]", ""));
                    return years > 0 ? now.plusYears(years) : now.plusMonths(12);
                }
                if (normalized.contains("month")) {
                    int months = Integer.parseInt(normalized.replaceAll("[^0-9]", ""));
                    return months > 0 ? now.plusMonths(months) : now.plusMonths(1);
                }
                if (normalized.contains("day")) {
                    int days = Integer.parseInt(normalized.replaceAll("[^0-9]", ""));
                    return days > 0 ? now.plusDays(days) : now.plusDays(30);
                }
            } catch (Exception ignored) {
                // fall back
            }
        }
        return now.plusDays(30);
    }
}
