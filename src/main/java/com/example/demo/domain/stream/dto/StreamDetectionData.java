package com.example.demo.domain.stream.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StreamDetectionData {

    private Long detectionId;
    private String deviceId;
    private Integer peopleCount;
    private String trackIds;
    private String detectedAt;
}