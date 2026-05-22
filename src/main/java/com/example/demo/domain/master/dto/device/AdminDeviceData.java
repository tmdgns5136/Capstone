package com.example.demo.domain.master.dto.device;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminDeviceData {
    private String deviceId;
    private String classroom;
    private String deviceName;
    private String deviceSecret;
    private String deviceStatus;
    private boolean loggedIn;
    private String uptime;
    private String lastHeartbeat;
    private String cameraStatus;
    private String networkStatus;
    private AdminDeviceConfigData config;
    private List<AdminDeviceErrorLogData> errorLogs;
}
