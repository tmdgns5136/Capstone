package com.example.demo.domain.device.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DeviceAckMqttRequest {
    private String commandId;
    private String commandType;
    private Long lectureId;
    private String deviceId;
    private String result;
    private String message;
    private String processedAt;
}