package com.myreport.backend.dto.payments;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RazorpaySignupOrderRequest(
        @Email @NotBlank @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$", message = "Email must be a valid .com address") String email,
        @NotBlank String planName,
        @NotNull @DecimalMin("1.0") BigDecimal amount
) {
}

