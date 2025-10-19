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

    // Common business rule violations
    public static BusinessException duplicateEntry(String resource) {
        return new BusinessException(
                "Duplicate entry",
                "DUPLICATE_ENTRY",
                String.format("%s already exists", resource)
        );
    }

    public static BusinessException invalidOperation(String operation) {
        return new BusinessException(
                "Invalid operation",
                "INVALID_OPERATION",
                String.format("Operation '%s' is not allowed in current state", operation)
        );
    }

    public static BusinessException limitExceeded(String limitType) {
        return new BusinessException(
                "Limit exceeded",
                "LIMIT_EXCEEDED",
                String.format("%s limit has been reached", limitType)
        );
    }
}