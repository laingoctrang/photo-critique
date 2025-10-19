package com.photo_critique_be.exception;

import jakarta.validation.ConstraintViolation;
import org.springframework.http.HttpStatus;
import java.util.Set;
import java.util.stream.Collectors;

public class ValidationException extends CustomException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    public ValidationException(String message, String details) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", details);
    }

    // Constructor for Bean Validation violations
    public <T> ValidationException(Set<ConstraintViolation<T>> violations) {
        super(
                "Validation failed",
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                violations.stream()
                        .map(v -> String.format("%s: %s", v.getPropertyPath(), v.getMessage()))
                        .collect(Collectors.joining("; "))
        );
    }
}
