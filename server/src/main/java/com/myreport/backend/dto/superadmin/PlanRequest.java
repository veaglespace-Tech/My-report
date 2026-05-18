package com.myreport.backend.dto.superadmin;

import com.myreport.backend.entity.enums.PlanStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record PlanRequest(
        @NotBlank String name,
        @NotBlank String duration,
        @NotBlank String description,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @NotNull @DecimalMin("0.0") BigDecimal monthlyPrice,
        @NotNull @DecimalMin("0.0") BigDecimal yearlyPrice,
        @NotNull @Positive Integer maxProducts,
        @NotNull @Positive Integer maxUsers,
        @NotNull @Positive Integer maxCustomers,
        @NotBlank String features,
        Boolean trialAvailable,
        Boolean popular,
        String buttonText,
        String themeColor,
        @NotNull PlanStatus status
) {
}
