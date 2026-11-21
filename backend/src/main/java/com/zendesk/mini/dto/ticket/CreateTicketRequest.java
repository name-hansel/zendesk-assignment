package com.zendesk.mini.dto.ticket;

import com.zendesk.mini.dto.user.CreateUserRequest;

import java.util.UUID;

public record CreateTicketRequest(String subject, String description, UUID customerUuid,
                                  CreateUserRequest user) {
}
