package com.example.demo.domain.device.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeviceRegisterRequest {
    @NotBlank(message = "deviceId이 누락되었습니다.")
    private String deviceId;

    @NotBlank(message = "classroom이 누락되었습니다.")
    private String classroom;

    @NotBlank(message = "deviceName이 누락되었습니다.")
    private String deviceName;
}
