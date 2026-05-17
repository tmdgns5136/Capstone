package com.example.demo.domain.device.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeviceLoginRequest {
    @NotBlank(message = "deviceId는 필수입니다.")
    private String deviceId;

    @NotBlank(message = "deviceSecret은 필수입니다.")
    private String deviceSecret;
}
