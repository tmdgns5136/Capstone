package com.example.demo.domain.device.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceCommandMqttRequest {
    private String commandId;
    private String commandType;
    private Long lectureId;
    private String classroom;
    private Integer captureIntervalSec;
    private String reason;
    private String issuedAt;
}