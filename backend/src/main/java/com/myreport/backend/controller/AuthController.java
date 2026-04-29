package com.myreport.backend.controller;

import com.myreport.backend.dto.auth.LoginRequest;
import com.myreport.backend.dto.auth.OtpVerificationRequest;
import com.myreport.backend.dto.auth.SignupRequest;
import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.service.AuthService;
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

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return new ApiResponse<>(true, "Login successful", authService.login(request));
    }

    @PostMapping("/admin/signup")
    public ApiResponse<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        return new ApiResponse<>(true, "Admin signup submitted", authService.signupAdmin(request));
    }

    @PostMapping("/admin/verify-otp")
    public ApiResponse<Map<String, Object>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        return new ApiResponse<>(true, "OTP verified", authService.verifyOtp(request));
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(Principal principal) {
        return new ApiResponse<>(true, "Profile loaded", authService.me(principal.getName()));
    }
}
