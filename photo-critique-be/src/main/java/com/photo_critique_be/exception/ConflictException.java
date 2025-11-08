package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;


public class ConflictException extends CustomException {

    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT, "CONFLICT");
    }

    public ConflictException(String message, String details) {
        super(message, HttpStatus.CONFLICT, "CONFLICT", details);
    }

    public ConflictException(String message, String errorCode, String details) {
        super(message, HttpStatus.CONFLICT, errorCode, details);
    }
}