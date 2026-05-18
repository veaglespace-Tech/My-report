package com.myreport.backend.dto.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @Valid @NotNull OrganizationRegistrationRequest organization,
        @Valid @NotNull AdminRegistrationRequest admin,
        @NotNull Long planId
) {
}
