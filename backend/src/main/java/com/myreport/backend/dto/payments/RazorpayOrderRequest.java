package com.myreport.backend.dto.payments;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RazorpayOrderRequest(
        @NotBlank String planName,
        @NotNull @DecimalMin("1.0") BigDecimal amount
) {
}
