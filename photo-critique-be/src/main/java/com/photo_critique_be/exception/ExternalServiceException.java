package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class ExternalServiceException extends CustomException {

    public ExternalServiceException(String serviceName, String message) {
        super(
                String.format("External service error: %s", serviceName),
                HttpStatus.BAD_GATEWAY,
                "EXTERNAL_SERVICE_ERROR",
                message
        );
    }

    public ExternalServiceException(String serviceName, String message, HttpStatus status) {
        super(
                String.format("External service error: %s", serviceName),
                status,
                "EXTERNAL_SERVICE_ERROR",
                message
        );
    }

    public static ExternalServiceException serviceUnavailable(String serviceName) {
        return new ExternalServiceException(
                serviceName,
                "Service is temporarily unavailable",
                HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public static ExternalServiceException timeout(String serviceName) {
        return new ExternalServiceException(
                serviceName,
                "Request to external service timed out",
                HttpStatus.GATEWAY_TIMEOUT
        );
    }
}
