package com.example.demo.domain.device.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceLoginData {
    private String deviceId;
    private String role;
    private String accessToken;
    private String tokenType;
}
