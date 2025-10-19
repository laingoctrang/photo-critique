package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class DatabaseException extends CustomException {

    public DatabaseException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR");
    }

    public DatabaseException(String message, String details) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", details);
    }

    public static DatabaseException connectionError() {
        return new DatabaseException(
                "Database connection error",
                "Unable to establish connection to the database"
        );
    }

    public static DatabaseException timeout() {
        return new DatabaseException(
                "Database timeout",
                "The database operation timed out"
        );
    }

    public static DatabaseException constraintViolation(String constraintName) {
        return new DatabaseException(
                "Database constraint violation",
                String.format("Constraint '%s' was violated", constraintName)
        );
    }
}
