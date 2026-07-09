package com.example.demo.domain.device.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceUploadResultData {
    private Long captureId;
    private String processingStatus;
    private Integer recognizedCount;
    private Integer unrecognizedCount;
    private String processedAt;
}
