package com.myreport.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminRegistrationRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "Password must contain at least 8 characters") String password,
        @NotBlank String confirmPassword,
        @NotBlank @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile must be 10 to 15 digits") String mobile,
        @NotBlank String gender
) {
}
