package com.photo_critique_be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;
    private final String details;

    public CustomException(String message, HttpStatus status) {
        this(message, status, null, null);
    }

    public CustomException(String message, HttpStatus status, String errorCode) {
        this(message, status, errorCode, null);
    }

    public CustomException(String message, HttpStatus status, String errorCode, String details) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
    }
}