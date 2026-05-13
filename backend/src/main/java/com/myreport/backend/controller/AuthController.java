package com.myreport.backend.controller;

import com.myreport.backend.dto.auth.LoginRequest;
import com.myreport.backend.dto.auth.ForgotPasswordRequest;
import com.myreport.backend.dto.auth.OtpVerificationRequest;
import com.myreport.backend.dto.auth.RegisterRequest;
import com.myreport.backend.dto.auth.ResetPasswordRequest;
import com.myreport.backend.dto.auth.SignupRequest;
import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.payments.RazorpaySignupOrderRequest;
import com.myreport.backend.dto.payments.RazorpayVerifyRequest;
import com.myreport.backend.service.AuthService;
import com.myreport.backend.service.PaymentService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PaymentService paymentService;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return new ApiResponse<>(true, "Login successful", authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return new ApiResponse<>(true, "Registration successful", authService.register(request));
    }

    @PostMapping("/register/razorpay/order")
    public ApiResponse<Map<String, Object>> createSignupOrder(@Valid @RequestBody RazorpaySignupOrderRequest request) {
        return new ApiResponse<>(true, "Razorpay signup order created", paymentService.createRazorpaySignupOrder(request));
    }

    @PostMapping("/register/razorpay/verify")
    public ApiResponse<Map<String, Object>> verifySignupPayment(@Valid @RequestBody RazorpayVerifyRequest request) {
        return new ApiResponse<>(true, "Razorpay signup payment verified", paymentService.verifyRazorpayPayment(request));
    }

    @PostMapping("/admin/signup")
    public ApiResponse<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        return new ApiResponse<>(true, "Admin signup submitted", authService.signupAdmin(request));
    }

    @PostMapping("/admin/verify-otp")
    public ApiResponse<Map<String, Object>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        return new ApiResponse<>(true, "OTP verified", authService.verifyOtp(request));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return new ApiResponse<>(true, "Reset link sent", authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ApiResponse<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return new ApiResponse<>(true, "Password reset successful", authService.resetPassword(request));
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(Principal principal) {
        return new ApiResponse<>(true, "Profile loaded", authService.me(principal.getName()));
    }
}
