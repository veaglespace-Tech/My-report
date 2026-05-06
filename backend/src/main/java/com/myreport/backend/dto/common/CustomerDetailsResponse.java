package com.myreport.backend.dto.common;

import java.math.BigDecimal;

public record CustomerDetailsResponse(
        Long id,
        String fullName,
        String mobileNumber,
        String address,
        BigDecimal totalBilling,
        Integer totalOrders
) {
}

