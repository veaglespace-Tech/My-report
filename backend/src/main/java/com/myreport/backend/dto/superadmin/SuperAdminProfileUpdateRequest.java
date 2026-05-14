package com.myreport.backend.dto.superadmin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SuperAdminProfileUpdateRequest(
        @NotBlank String fullName,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") String mobileNumber,
        @NotBlank String city,
        @NotBlank String address
) {
}
