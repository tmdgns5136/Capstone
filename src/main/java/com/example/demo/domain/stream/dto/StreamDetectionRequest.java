package com.example.demo.domain.stream.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StreamDetectionRequest {

    @NotBlank
    private String deviceId;

    @NotNull
    @Min(0)
    private Integer peopleCount;

    private List<Integer> trackIds;

    @NotBlank
    private String detectedAt;
}