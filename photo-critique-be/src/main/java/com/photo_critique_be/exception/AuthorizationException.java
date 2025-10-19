package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class AuthorizationException extends CustomException {

    public AuthorizationException(String message) {
        super(message, HttpStatus.FORBIDDEN, "ACCESS_DENIED");
    }

    public AuthorizationException(String message, String details) {
        super(message, HttpStatus.FORBIDDEN, "ACCESS_DENIED", details);
    }

    public static AuthorizationException insufficientPermissions() {
        return new AuthorizationException(
                "Insufficient permissions",
                "You don't have the required permissions to access this resource"
        );
    }

    public static AuthorizationException resourceOwnership() {
        return new AuthorizationException(
                "Resource access denied",
                "You can only access your own resources"
        );
    }
}
