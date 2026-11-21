package com.zendesk.mini.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CommentRequest(
        @NotNull UUID ticketId,
        @NotNull UUID userId,
        @NotBlank String body
) {
}
