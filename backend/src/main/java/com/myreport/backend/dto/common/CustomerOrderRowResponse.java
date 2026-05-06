package com.myreport.backend.dto.common;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomerOrderRowResponse(
        Long id,
        LocalDateTime orderDate,
        String productName,
        Double quantity,
        BigDecimal price,
        BigDecimal totalAmount
) {
}

