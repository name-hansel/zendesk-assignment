package com.zendesk.mini.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class CustomerNotFoundException extends ApiException {
    public CustomerNotFoundException(UUID customerId) {
        super(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found: " + customerId);
    }
}
