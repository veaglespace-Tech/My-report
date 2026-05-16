package com.myreport.backend.dto.auth;

import com.myreport.backend.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequest(
        @NotBlank
        String email,
        @NotBlank String password,
        @NotNull Role role,
        Boolean rememberMe
) {
}
