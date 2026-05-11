package com.myreport.backend.dto.superadmin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StoreCreateRequest(
        @NotBlank String name,
        @NotBlank String storeType,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") String phone,
        @NotBlank String city,
        @NotBlank String address
) {
}

