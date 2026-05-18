package com.myreport.backend.dto.common;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomerOrderRowResponse(
        Long id,
        String customerName,
        String customerMobile,
        String customerAddress,
        LocalDateTime orderDate,
        String productName,
        Double quantity,
        BigDecimal price,
        BigDecimal totalAmount
) {
}

