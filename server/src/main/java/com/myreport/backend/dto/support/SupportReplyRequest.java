package com.myreport.backend.dto.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SupportReplyRequest(
        @NotNull Long id,
        @NotBlank String replyMessage
) {}
