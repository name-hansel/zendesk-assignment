package com.zendesk.mini.dto.user;

import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.UserRole;

import java.util.UUID;

public record UserResponse(UUID id, String userId, String name, String email, String phoneNumber, UserRole role) {
    public static UserResponse from(UserEntity userEntity) {
        return new UserResponse(userEntity.getId(), userEntity.getUserId(), userEntity.getName(), userEntity.getEmail(),
                userEntity.getPhoneNumber(), userEntity.getRole());
    }
}
