package com.example.demo.domain.device.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeviceLogRequest {
    @NotBlank(message = "deviceId는 필수입니다.")
    private String deviceId;

    @NotBlank(message = "errorCode는 필수입니다.")
    private String errorCode;

    @NotBlank(message = "message는 필수입니다.")
    private String message;

    @NotBlank(message = "createdAt은 필수입니다.")
    private String createdAt;
}
