package com.myreport.backend.dto.admin;

import com.myreport.backend.entity.enums.ProductUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String name,
        @NotBlank String sku,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @NotNull @Positive Double quantity,
        @NotNull @Positive Double reorderThreshold,
        @NotNull ProductUnit unit,
        Boolean active
) {
}
