package com.zendesk.mini.dto.ticket;

import com.zendesk.mini.dto.user.CreateUserRequest;

public record CreateTicketRequest(String subject, String description, String customerId,
                                  CreateUserRequest customer) {
}
