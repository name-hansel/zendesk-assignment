package com.zendesk.mini.dto;

import com.zendesk.mini.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record StatusHistoryRequest(
        @NotNull UUID ticketId,
        TicketStatus prevStatus,
        @NotNull TicketStatus newStatus,
        Instant timestamp
) {
}
