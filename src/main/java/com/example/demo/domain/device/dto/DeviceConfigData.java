package com.example.demo.domain.device.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DeviceConfigData {
    private String deviceId;
    private String classroom;
    private boolean active;
    private Integer captureIntervalSec;
    private Integer heartbeatIntervalSec;
    private Integer imageWidth;
    private Integer imageHeight;
    private Integer imageQuality;
    private Integer maxUploadSizeMb;
    private List<String> allowedImageTypes;
    private Integer offlineStorageLimit;
    private String timezone;
    private String serverTime;
    private DeviceMqttData mqtt;
}
