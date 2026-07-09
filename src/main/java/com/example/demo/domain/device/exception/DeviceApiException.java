package com.example.demo.domain.device.exception;

import lombok.Getter;

@Getter
public class DeviceApiException extends RuntimeException {
    private final int status;
    private final String errorCode;

    public DeviceApiException(int status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }
}
