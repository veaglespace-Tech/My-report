package com.myreport.backend.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record BillingItemRequest(
        @NotBlank String productName,
        @NotNull @Positive Double quantity,
        @NotNull @DecimalMin("0.0") BigDecimal rate
) {
}
