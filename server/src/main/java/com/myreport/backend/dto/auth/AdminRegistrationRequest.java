package com.myreport.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminRegistrationRequest(
        @NotBlank String fullName,
        @NotBlank @Email @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$", message = "Email must be a valid .com address") String email,
        @NotBlank @Size(min = 8, message = "Password must contain at least 8 characters") String password,
        @NotBlank String confirmPassword,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Mobile must be exactly 10 digits") String mobile,
        @NotBlank String gender
) {
}
