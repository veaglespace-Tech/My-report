package com.myreport.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OrganizationRegistrationRequest(
        @NotBlank String organizationName,
        @NotBlank String storeType,
        @NotBlank @Email @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$", message = "Business email must be a valid .com address") String businessEmail,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String country,
        @NotBlank @Size(min = 10, message = "Address must be at least 10 characters") @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\s).{10,}$", message = "Please enter a full address") String address,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits") String phone
) {
}
