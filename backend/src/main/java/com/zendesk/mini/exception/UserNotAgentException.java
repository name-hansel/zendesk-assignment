package com.zendesk.mini.exception;

import org.springframework.http.HttpStatus;

public class UserNotAgentException extends ApiException {
    public UserNotAgentException(String userId) {
        super(HttpStatus.BAD_REQUEST, "USER_NOT_AGENT", "User is not an agent: " + userId);
    }
}
