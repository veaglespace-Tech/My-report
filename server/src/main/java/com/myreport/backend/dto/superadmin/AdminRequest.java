package com.myreport.backend.dto.superadmin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminRequest(
        @NotBlank String fullName,
        @NotBlank @Email @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$", message = "Email must be a valid .com address") String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits") String mobileNumber,
        @Pattern(regexp = "^$|^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$", message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character")
        String password,
        @NotBlank String storeName,
        @NotBlank String city,
        @NotBlank @Size(min = 10, message = "Address must be at least 10 characters") @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\s).{10,}$", message = "Please enter a full address") String address,
        @NotNull Long planId
) {
}
