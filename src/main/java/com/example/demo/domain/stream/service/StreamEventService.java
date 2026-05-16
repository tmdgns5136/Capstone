package com.example.demo.domain.stream.service;

import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.exception.DeviceApiException;
import com.example.demo.domain.device.repository.DeviceRepository;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import com.example.demo.domain.student.lecture.repository.LectureSessionRepository;
import com.example.demo.domain.stream.dto.StreamEventData;
import com.example.demo.domain.stream.dto.StreamEventRequest;
import com.example.demo.domain.stream.entity.StreamEvent;
import com.example.demo.domain.stream.entity.StreamEventType;
import com.example.demo.domain.stream.repository.StreamEventRepository;
import com.example.demo.global.response.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

@Service
@Transactional
public class StreamEventService {

    private final DeviceRepository deviceRepository;
    private final LectureSessionRepository lectureSessionRepository;
    private final StreamEventRepository streamEventRepository;

    public StreamEventService(
            DeviceRepository deviceRepository,
            LectureSessionRepository lectureSessionRepository,
            StreamEventRepository streamEventRepository
    ) {
        this.deviceRepository = deviceRepository;
        this.lectureSessionRepository = lectureSessionRepository;
        this.streamEventRepository = streamEventRepository;
    }

    public ApiResponse<StreamEventData> saveEvent(
            Authentication authentication,
            StreamEventRequest request
    ) {
        Device device = getAuthenticatedDevice(authentication);

        if (!device.getDeviceId().equals(request.getDeviceId())) {
            throw new DeviceApiException(
                    403,
                    "DEVICE_ID_MISMATCH",
                    "인증된 장치 정보와 요청 장치 정보가 일치하지 않습니다."
            );
        }

        LocalDateTime eventTime = parseEventTime(request.getEventTime());

        LectureSession lectureSession = lectureSessionRepository
                .findCurrentSessionByClassroomAndTime(device.getClassroom(), eventTime)
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "LECTURE_NOT_FOUND",
                        "해당 시점에 진행 중인 강의 정보를 찾을 수 없습니다."
                ));

        StreamEventType eventType = parseEventType(request.getEventType());

        StreamEvent event = new StreamEvent();
        event.setDevice(device);
        event.setDeviceId(device.getDeviceId());
        event.setLectureSession(lectureSession);
        event.setEventType(eventType);
        event.setBeforeCount(request.getBeforeCount());
        event.setAfterCount(request.getAfterCount());
        event.setDiffCount(request.getDiffCount());
        event.setEventTime(eventTime);
        event.setRecognitionProcessed(false);

        streamEventRepository.save(event);

        StreamEventData data = new StreamEventData(
                event.getEventId(),
                event.getDeviceId(),
                lectureSession.getSessionId(),
                event.getEventType().name(),
                event.getBeforeCount(),
                event.getAfterCount(),
                event.getDiffCount(),
                event.getEventTime().toString(),
                event.getRecognitionProcessed()
        );

        return ApiResponse.success(
                201,
                data,
                "실시간 사람 수 변화 이벤트가 저장되었습니다."
        );
    }

    private Device getAuthenticatedDevice(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new DeviceApiException(401, "AUTH_REQUIRED", "로그인이 필요한 서비스입니다.");
        }

        return deviceRepository.findByDeviceId(authentication.getName())
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "DEVICE_NOT_FOUND",
                        "장치 정보를 찾을 수 없습니다."
                ));
    }

    private LocalDateTime parseEventTime(String value) {
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException e) {
            try {
                return LocalDateTime.parse(value);
            } catch (DateTimeParseException ex) {
                throw new DeviceApiException(
                        400,
                        "INVALID_EVENT_TIME",
                        "이벤트 시각 형식이 올바르지 않습니다."
                );
            }
        }
    }

    private StreamEventType parseEventType(String value) {
        try {
            return StreamEventType.valueOf(value);
        } catch (Exception e) {
            throw new DeviceApiException(
                    400,
                    "INVALID_EVENT_TYPE",
                    "이벤트 타입은 ENTER 또는 EXIT만 가능합니다."
            );
        }
    }
}