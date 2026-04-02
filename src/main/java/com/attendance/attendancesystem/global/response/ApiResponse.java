package com.attendance.attendancesystem.global.response;

public class ApiResponse<T> {

    private final int status;
    private final boolean success;
    private final T data;
    private final String message;

    private ApiResponse(int status, boolean success, T data, String message) {
        this.status = status;
        this.success = success;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, true, data, null);
    }

    public static <T> ApiResponse<T> fail(int status, String message) {
        return new ApiResponse<>(status, false, null, message);
    }

    public int getStatus() {
        return status;
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }
}