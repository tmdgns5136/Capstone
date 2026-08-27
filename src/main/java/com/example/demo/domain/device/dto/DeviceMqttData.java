package com.example.demo.domain.device.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceMqttData {
    private String brokerUrl;
    private String clientId;
    private String username;
    private String password;
    private boolean tlsEnabled;
    private Integer qos;
    private String commandTopic;
    private String ackTopic;
    private String heartbeatTopic;
    private String errorTopic;
}