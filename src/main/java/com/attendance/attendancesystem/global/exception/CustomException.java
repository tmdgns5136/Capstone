package com.attendance.attendancesystem.global.exception;

public class CustomException extends RuntimeException {

    private final int status;

    public CustomException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}