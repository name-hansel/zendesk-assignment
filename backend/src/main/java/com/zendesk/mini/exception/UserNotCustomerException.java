package com.zendesk.mini.exception;

import org.springframework.http.HttpStatus;

public class UserNotCustomerException extends ApiException {
    public UserNotCustomerException(String customerId) {
        super(HttpStatus.BAD_REQUEST, "USER_NOT_CUSTOMER", "User is not a customer: " + customerId);
    }
}
