package com.example.demo.domain.stream.service;

import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.exception.DeviceApiException;
import com.example.demo.domain.device.repository.DeviceRepository;
import com.example.demo.domain.stream.dto.StreamDetectionData;
import com.example.demo.domain.stream.dto.StreamDetectionRequest;
import com.example.demo.domain.stream.entity.StreamDetection;
import com.example.demo.domain.stream.repository.StreamDetectionRepository;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StreamDetectionService {

    private final DeviceRepository deviceRepository;
    private final StreamDetectionRepository streamDetectionRepository;

    public ApiResponse<StreamDetectionData> saveDetection(
            Authentication authentication,
            StreamDetectionRequest request
    ) {
        Device device = getAuthenticatedDevice(authentication);

        if (!device.getDeviceId().equals(request.getDeviceId())) {
            throw new DeviceApiException(
                    403,
                    "DEVICE_ID_MISMATCH",
                    "인증된 장치 정보와 요청 장치 정보가 일치하지 않습니다."
            );
        }

        String trackIds = "";
        if (request.getTrackIds() != null && !request.getTrackIds().isEmpty()) {
            trackIds = request.getTrackIds()
                    .stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        }

        StreamDetection detection = StreamDetection.builder()
                .device(device)
                .deviceId(device.getDeviceId())
                .peopleCount(request.getPeopleCount())
                .trackIds(trackIds)
                .detectedAt(parseDetectedAt(request.getDetectedAt()))
                .build();

        streamDetectionRepository.save(detection);

        return ApiResponse.success(
                201,
                StreamDetectionData.builder()
                        .detectionId(detection.getDetectionId())
                        .deviceId(detection.getDeviceId())
                        .peopleCount(detection.getPeopleCount())
                        .trackIds(detection.getTrackIds())
                        .detectedAt(detection.getDetectedAt().toString())
                        .build(),
                "실시간 객체탐지 결과가 저장되었습니다."
        );
    }

    private Device getAuthenticatedDevice(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new DeviceApiException(401, "AUTH_REQUIRED", "로그인이 필요한 서비스입니다.");
        }

        return deviceRepository.findByDeviceId(authentication.getName())
                .orElseThrow(() -> new DeviceApiException(404, "DEVICE_NOT_FOUND", "장치 정보를 찾을 수 없습니다."));
    }

    private java.time.LocalDateTime parseDetectedAt(String value) {
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException e) {
            throw new DeviceApiException(400, "INVALID_DETECTED_AT", "감지 시각 형식이 올바르지 않습니다.");
        }
    }
}