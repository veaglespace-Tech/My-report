package com.myreport.backend.dto.support;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChatbotSupportRequest(
        @NotBlank String name,
        @NotBlank @Email @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$", message = "Email must be a valid .com address") String email,
        @Pattern(regexp = "^$|^[0-9]{10}$", message = "Phone must be exactly 10 digits") String phone,
        @NotBlank String message
) {}
