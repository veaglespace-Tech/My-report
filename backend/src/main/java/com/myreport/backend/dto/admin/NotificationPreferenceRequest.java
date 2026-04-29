package com.myreport.backend.dto.admin;

public record NotificationPreferenceRequest(
        Boolean lowStockAlerts,
        Boolean planExpiryAlerts,
        Boolean paymentAlerts,
        Boolean darkMode
) {
}
