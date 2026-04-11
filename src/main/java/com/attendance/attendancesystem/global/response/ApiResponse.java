package com.attendance.attendancesystem.global.response;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Data
@Builder
public class ApiResponse<T> {
    private final Integer status;
    private final boolean success;
    private final T data;
    private final String message;
    private final String redirectUrl;

    public static <T> ApiResponse<T> success(Integer status, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(Integer status, T data, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> success(Integer status, T data, String message, String redirectUrl) {
        return ApiResponse.<T>builder()
                .status(status)
                .success(true)
                .data(data)
                .message(message)
                .redirectUrl(redirectUrl)
                .build();
    }

    public static <T> ApiResponse<T> fail(Integer status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .success(false)
                .message(message)
                .build();
    }
}