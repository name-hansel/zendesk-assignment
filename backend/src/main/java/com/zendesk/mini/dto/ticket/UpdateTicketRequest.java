package com.zendesk.mini.dto.ticket;

import com.zendesk.mini.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateTicketRequest(
        @NotBlank @Size(max = 255) String subject,
        @NotBlank String description,
        UUID agentId,
        TicketStatus status
) {
}
