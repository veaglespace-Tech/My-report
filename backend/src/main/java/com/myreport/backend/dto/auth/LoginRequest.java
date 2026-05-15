package com.myreport.backend.dto.auth;

import com.myreport.backend.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @NotBlank
        @Email
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$",
                message = "Email must be a valid .com address"
        )
        String email,
        @NotBlank String password,
        @NotNull Role role,
        Boolean rememberMe
) {
}
