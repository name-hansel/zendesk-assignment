package com.zendesk.mini.dto;

import com.zendesk.mini.entity.StatusHistoryEntity;
import com.zendesk.mini.enums.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record StatusHistoryResponse(
        UUID id,
        UUID ticketId,
        TicketStatus prevStatus,
        TicketStatus newStatus,
        Instant timestamp
) {

    public static StatusHistoryResponse from(StatusHistoryEntity entity) {
        return new StatusHistoryResponse(
                entity.getId(),
                entity.getTicket().getId(),
                entity.getPrevStatus(),
                entity.getNewStatus(),
                entity.getTimestamp()
        );
    }
}
