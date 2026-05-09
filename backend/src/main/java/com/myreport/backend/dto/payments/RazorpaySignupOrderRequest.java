package com.myreport.backend.dto.payments;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RazorpaySignupOrderRequest(
        @Email @NotBlank String email,
        @NotBlank String planName,
        @NotNull @DecimalMin("1.0") BigDecimal amount
) {
}

