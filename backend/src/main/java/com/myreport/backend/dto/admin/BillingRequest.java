package com.myreport.backend.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

public record BillingRequest(
        @NotBlank String customerName,
        @Valid @NotEmpty List<BillingItemRequest> items,
        @DecimalMin("0.0") BigDecimal gstPercentage,
        @DecimalMin("0.0") BigDecimal discountAmount,
        String notes
) {
}
