package com.myreport.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProfileUpdateRequest(
        @NotBlank String fullName,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") String mobileNumber,
        @NotBlank String city,
        @NotBlank String address,
        @NotBlank String storeName
) {
}
