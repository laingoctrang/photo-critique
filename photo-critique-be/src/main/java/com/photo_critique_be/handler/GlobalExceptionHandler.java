package com.photo_critique_be.handler;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle custom exceptions
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustomException(CustomException ex, WebRequest request) {
        log.error("Custom exception: {}", ex.getMessage(), ex);

        ApiResponse<Object> response = ApiResponse.error(
                ex.getStatus(),
                ex.getMessage(),
                ex.getErrorCode(),
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, ex.getStatus());
    }

    // Handle resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                ex.getErrorCode(),
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        List<String> globalErrors = ex.getBindingResult().getGlobalErrors().stream()
                .map(error -> error.getObjectName() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        String errorMessage = "Validation failed for " + ex.getObjectName();

        ApiResponse<Object> response = ApiResponse.validationError(
                HttpStatus.BAD_REQUEST,
                errorMessage,
                fieldErrors,
                globalErrors,
                getRequestPath(request)
        );

        log.warn("Validation error: {}", errorMessage);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handle file size limit exceeded
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxSizeException(
            MaxUploadSizeExceededException ex, WebRequest request) {

        String message = "File size exceeds maximum allowed limit";

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.PAYLOAD_TOO_LARGE,
                message,
                "FILE_TOO_LARGE",
                getRequestPath(request)
        );

        log.warn("File upload size exceeded: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    // Handle authentication exceptions
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        log.warn("Authentication failed: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                ex.getErrorCode(),
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // Handle authorization exceptions
    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthorizationException(
            AuthorizationException ex, WebRequest request) {

        log.warn("Authorization failed: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.FORBIDDEN,
                ex.getMessage(),
                ex.getErrorCode(),
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    // Handle business exceptions
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(
            BusinessException ex, WebRequest request) {

        log.warn("Business rule violation: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.UNPROCESSABLE_ENTITY,
                ex.getMessage(),
                ex.getErrorCode(),
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // Handle conflict exceptions
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Object>> handleConflictException(
            ConflictException ex, WebRequest request) {

        log.warn("Conflict exception: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                ex.getErrorCode(),
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    // Handle all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(
            Exception ex, WebRequest request) {

        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                "INTERNAL_SERVER_ERROR",
                getRequestPath(request)
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String getRequestPath(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            HttpServletRequest servletRequest = ((ServletWebRequest) request).getRequest();
            return servletRequest.getRequestURI();
        }
        return "Unknown";
    }

    private String getStackTrace(Exception ex) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : ex.getStackTrace()) {
            sb.append(element.toString()).append("\n");
        }
        return sb.toString();
    }

    private boolean isDevelopment() {
        String env = System.getenv("SPRING_PROFILES_ACTIVE");
        return "dev".equals(env) || "development".equals(env);
    }
}
