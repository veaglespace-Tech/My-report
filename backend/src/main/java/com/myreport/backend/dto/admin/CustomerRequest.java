package com.myreport.backend.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CustomerRequest(
        @NotBlank String fullName,
        @Email String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") String mobileNumber,
        @NotBlank String city,
        Boolean blocked
) {
}
