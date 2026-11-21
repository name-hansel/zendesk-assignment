package com.zendesk.mini.dto;

import com.zendesk.mini.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotBlank @Size(max = 32) String userId,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 20) String phoneNumber,
        @NotNull UserRole role
) {
}
