package com.myreport.backend.dto.superadmin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") String mobileNumber,
        @Size(min = 8) String password,
        @NotBlank String storeName,
        @NotBlank String city,
        @NotBlank String address,
        @NotNull Long planId
) {
}
