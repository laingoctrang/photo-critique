package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class AuthenticationException extends CustomException {

    public AuthenticationException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
    }

    public AuthenticationException(String message, String details) {
        super(message, HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", details);
    }

    // Specific authentication cases
    public static AuthenticationException invalidCredentials() {
        return new AuthenticationException(
                "Invalid username or password",
                "The provided credentials are incorrect"
        );
    }

    public static AuthenticationException tokenExpired() {
        return new AuthenticationException(
                "Token has expired",
                "The authentication token is no longer valid"
        );
    }

    public static AuthenticationException invalidToken() {
        return new AuthenticationException(
                "Invalid token",
                "The provided token is malformed or invalid"
        );
    }
}
