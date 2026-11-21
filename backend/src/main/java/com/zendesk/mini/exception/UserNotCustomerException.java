package com.zendesk.mini.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class UserNotCustomerException extends ApiException {
    public UserNotCustomerException(UUID userId) {
        super(HttpStatus.BAD_REQUEST, "USER_NOT_CUSTOMER", "User is not a customer: " + userId);
    }
}
