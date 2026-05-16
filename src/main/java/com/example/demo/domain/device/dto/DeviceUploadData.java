package com.example.demo.domain.device.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceUploadData {
    private Long captureId;
    private String processingStatus;
}