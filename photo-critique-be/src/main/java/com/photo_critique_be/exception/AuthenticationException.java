package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class AuthenticationException extends CustomException {

    public AuthenticationException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
    }

    public AuthenticationException(String message, String details) {
        super(message, HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", details);
    }

}
