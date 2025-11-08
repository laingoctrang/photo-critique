package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends CustomException {

    public BusinessException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION");
    }

    public BusinessException(String message, String details) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION", details);
    }

    public BusinessException(String message, String errorCode, String details) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode, details);
    }
}