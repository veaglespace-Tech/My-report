package com.myreport.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OrganizationRegistrationRequest(
        @NotBlank String organizationName,
        @NotBlank @Email String businessEmail,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String country,
        @NotBlank String address,
        @NotBlank @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10 to 15 digits") String phone
) {
}
