package com.example.demo.domain.device.dto;

import com.example.demo.domain.device.enumerate.CameraStatus;
import com.example.demo.domain.device.enumerate.NetworkStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeviceHeartbeatRequest {
    @NotBlank(message = "deviceId는 필수입니다.")
    private String deviceId;

    @NotNull(message = "cameraStatus는 필수입니다.")
    private CameraStatus cameraStatus;

    @NotNull(message = "networkStatus는 필수입니다.")
    private NetworkStatus networkStatus;

    @NotBlank(message = "sentAt은 필수입니다.")
    private String sentAt;
}
