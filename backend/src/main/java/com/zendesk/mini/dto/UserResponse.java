package com.zendesk.mini.dto;

import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String userId,
        String name,
        String email,
        String phoneNumber,
        UserRole role,
        Instant createdAt
) {

    public static UserResponse from(UserEntity entity) {
        return new UserResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhoneNumber(),
                entity.getRole(),
                entity.getCreatedAt()
        );
    }
}
