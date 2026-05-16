package com.example.demo.global.exception;

public class CustomException extends RuntimeException {

    private final Integer status;

    public CustomException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}