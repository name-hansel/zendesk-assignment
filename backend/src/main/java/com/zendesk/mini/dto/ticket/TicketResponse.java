package com.zendesk.mini.dto.ticket;

import com.zendesk.mini.dto.user.UserResponse;
import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(UUID id, String subject, String description, UserResponse customer, UserResponse agent,
                             TicketStatus status, Instant createdAt, Instant updatedAt, Instant closedAt) {

    public static TicketResponse from(TicketEntity ticket, UserEntity customer) {
        return new TicketResponse(ticket.getId(), ticket.getSubject(), ticket.getDescription(),
                UserResponse.from(customer), null, ticket.getStatus(),
                ticket.getCreatedAt(), ticket.getUpdatedAt(), ticket.getClosedAt());
    }
}
