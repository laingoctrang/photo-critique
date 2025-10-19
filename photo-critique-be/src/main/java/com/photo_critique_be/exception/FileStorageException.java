package com.photo_critique_be.exception;

import org.springframework.http.HttpStatus;

public class FileStorageException extends CustomException {

    public FileStorageException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "FILE_STORAGE_ERROR");
    }

    public FileStorageException(String message, String details) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "FILE_STORAGE_ERROR", details);
    }

    public static FileStorageException fileNotFound(String filename) {
        return new FileStorageException(
                "File not found",
                String.format("File '%s' was not found in storage", filename)
        );
    }

    public static FileStorageException uploadFailed(String filename) {
        return new FileStorageException(
                "File upload failed",
                String.format("Failed to upload file '%s'", filename)
        );
    }

    public static FileStorageException invalidFileType(String allowedTypes) {
        return new FileStorageException(
                "Invalid file type",
                String.format("Only the following file types are allowed: %s", allowedTypes)
        );
    }

    public static FileStorageException fileTooLarge(long maxSize) {
        return new FileStorageException(
                "File too large",
                String.format("File size exceeds the maximum allowed size of %d bytes", maxSize)
        );
    }
}
