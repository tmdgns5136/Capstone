package com.example.demo.domain.device.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DeviceErrorMqttRequest {
    private String deviceId;
    private String errorCode;
    private String message;
    private String createdAt;
}