package com.myreport.backend.dto.support;

import com.myreport.backend.entity.enums.SupportEnquiryStatus;
import jakarta.validation.constraints.NotNull;

public record SupportStatusRequest(
        @NotNull Long id,
        @NotNull SupportEnquiryStatus status
) {}
