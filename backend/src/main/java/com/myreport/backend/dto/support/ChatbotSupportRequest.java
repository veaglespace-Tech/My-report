package com.myreport.backend.dto.support;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChatbotSupportRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String phone,
        @NotBlank String message
) {}
