package com.photo_critique_be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private int status;
    private String message;
    private boolean success;
    private T data;
    private String path;
    private String errorCode;
    private Map<String, String> fieldErrors;
    private List<String> globalErrors;

    // ===== SUCCESS METHODS =====
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.OK.value())
                .build();
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.CREATED.value())
                .build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return created(data, "Resource created successfully");
    }

    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .status(HttpStatus.OK.value())
                .build();
    }

    public static ApiResponse<Void> noContent() {
        return ApiResponse.<Void>builder()
                .success(true)
                .message("No content")
                .status(HttpStatus.NO_CONTENT.value())
                .build();
    }

    // ===== ERROR METHODS =====
    public static <T> ApiResponse<T> error(HttpStatus status, String message) {
        return error(status, message, null, null);
    }

    public static <T> ApiResponse<T> error(HttpStatus status, String message, String errorCode) {
        return error(status, message, errorCode, null);
    }

    public static <T> ApiResponse<T> error(HttpStatus status, String message, String errorCode, String path) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .status(status.value())
                .errorCode(errorCode)
                .path(path)
                .build();
    }

    public static <T> ApiResponse<T> validationError(HttpStatus status, String message,
                                                     Map<String, String> fieldErrors,
                                                     List<String> globalErrors, String path) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .status(status.value())
                .errorCode("VALIDATION_ERROR")
                .path(path)
                .fieldErrors(fieldErrors)
                .globalErrors(globalErrors)
                .build();
    }
}