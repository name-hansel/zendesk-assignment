package com.zendesk.mini.dto;

import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.enums.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String subject,
        String description,
        UUID customerId,
        UUID agentId,
        TicketStatus status,
        Instant createdAt,
        Instant updatedAt,
        Instant closedAt
) {

    public static TicketResponse from(TicketEntity entity) {
        return new TicketResponse(
                entity.getId(),
                entity.getSubject(),
                entity.getDescription(),
                entity.getCustomer().getId(),
                entity.getAgent() == null ? null : entity.getAgent().getId(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getClosedAt()
        );
    }
}
