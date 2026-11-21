package com.zendesk.mini.dto;

import com.zendesk.mini.entity.CommentEntity;

import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID ticketId,
        UUID userId,
        String body
) {

    public static CommentResponse from(CommentEntity entity) {
        return new CommentResponse(
                entity.getId(),
                entity.getTicket().getId(),
                entity.getUser().getId(),
                entity.getBody()
        );
    }
}
