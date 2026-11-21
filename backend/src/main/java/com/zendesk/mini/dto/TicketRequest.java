package com.zendesk.mini.dto;

import com.zendesk.mini.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TicketRequest(
        @NotBlank @Size(max = 255) String subject,
        @NotBlank String description,
        @NotNull UUID customerId,
        UUID agentId,
        TicketStatus status
) {
}
