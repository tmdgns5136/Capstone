package com.example.demo.domain.device.service;

import com.example.demo.domain.device.dto.*;
import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.entity.DeviceCapture;
import com.example.demo.domain.device.entity.DeviceCommandAck;
import com.example.demo.domain.device.entity.DeviceErrorLog;
import com.example.demo.domain.device.enumerate.DeviceProcessingStatus;
import com.example.demo.domain.device.enumerate.DeviceStatus;
import com.example.demo.domain.device.exception.DeviceApiException;
import com.example.demo.domain.device.repository.DeviceCaptureRepository;
import com.example.demo.domain.device.repository.DeviceCommandAckRepository;
import com.example.demo.domain.device.repository.DeviceErrorLogRepository;
import com.example.demo.domain.device.repository.DeviceRepository;
import com.example.demo.domain.enumerate.RoleType;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import com.example.demo.domain.student.lecture.repository.LectureSessionRepository;
import com.example.demo.domain.recognition.service.FaceRecognitionService;
import com.example.demo.domain.stream.repository.StreamEventRepository;
import com.example.demo.global.jwt.Token;
import com.example.demo.global.jwt.TokenProvider;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.*;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceCaptureRepository deviceCaptureRepository;
    private final DeviceErrorLogRepository deviceErrorLogRepository;
    private final LectureSessionRepository lectureSessionRepository;
    private final TokenProvider tokenProvider;
    private final DeviceCommandAckRepository deviceCommandAckRepository;
    private final DeviceCommandPublisher deviceCommandPublisher;
    private final FaceRecognitionService faceRecognitionService;
    private final StreamEventRepository streamEventRepository;

    @Value("${device.upload.path:./uploads/device-attendance}")
    private String deviceUploadPath;

    @Value("${device.mqtt.broker-url:mqtts://broker.example.com:8883}")
    private String mqttBrokerUrl;

    @Value("${device.mqtt.username:mqtt-device-user}")
    private String mqttUsername;

    @Value("${device.mqtt.password:mqtt-device-password}")
    private String mqttPassword;

    @Value("${device.mqtt.tls-enabled:true}")
    private boolean mqttTlsEnabled;

    @Value("${device.mqtt.qos:1}")
    private Integer mqttQos;

    @Value("${device.default-timezone:Asia/Seoul}")
    private String defaultTimezone;

    public ApiResponse<DeviceRegisterData> register(DeviceRegisterRequest request) {
        if (deviceRepository.existsByDeviceId(request.getDeviceId())) {
            throw new DeviceApiException(409, "DEVICE_ID_DUPLICATED", "이미 등록된 장치 ID입니다.");
        }

        String generatedSecret = generateDeviceSecret();

        Device device = Device.builder()
                .deviceId(request.getDeviceId())
                .deviceSecret(generatedSecret)
                .classroom(request.getClassroom())
                .deviceName(request.getDeviceName())
                .deviceStatus(DeviceStatus.REGISTERED)
                .build();

        deviceRepository.save(device);

        return ApiResponse.success(
                201,
                DeviceRegisterData.builder()
                        .deviceId(device.getDeviceId())
                        .classroom(device.getClassroom())
                        .deviceSecret(generatedSecret)
                        .deviceStatus(device.getDeviceStatus().name())
                        .build(),
                "장치 등록이 완료되었습니다."
        );
    }

    @Transactional(readOnly = true)
    public ApiResponse<DeviceLoginData> login(DeviceLoginRequest request) {
        Device device = deviceRepository.findByDeviceId(request.getDeviceId())
                .orElseThrow(() -> new DeviceApiException(404, "DEVICE_NOT_FOUND", "등록되지 않은 장치입니다."));

        if (!device.getDeviceSecret().equals(request.getDeviceSecret())) {
            throw new DeviceApiException(400, "INVALID_DEVICE_CREDENTIAL", "장치 ID 또는 인증키가 일치하지 않습니다.");
        }

        Date accessExpiry = Date.from(Instant.now().plus(Duration.ofHours(24)));
        Token token = tokenProvider.createToken(device.getDeviceId(), RoleType.DEVICE.getCode(), accessExpiry);

        return ApiResponse.success(
                200,
                DeviceLoginData.builder()
                        .deviceId(device.getDeviceId())
                        .role("DEVICE")
                        .accessToken(token.getToken())
                        .tokenType("Bearer")
                        .build(),
                "장치 로그인에 성공했습니다."
        );
    }

    public ActionResponse logout(Authentication authentication) {
        ensureAuthenticated(authentication);
        return ActionResponse.success(200, "장치 로그아웃이 완료되었습니다.");
    }

    @Transactional(readOnly = true)
    public ApiResponse<DeviceConfigData> getConfig(Authentication authentication) {
        Device device = getAuthenticatedDevice(authentication);
        String timezone = resolveTimezone(device);
        ZoneId zoneId = ZoneId.of(timezone);

        return ApiResponse.success(
                200,
                DeviceConfigData.builder()
                        .deviceId(device.getDeviceId())
                        .classroom(device.getClassroom())
                        .active(device.isActive())
                        .captureIntervalSec(device.getCaptureIntervalSec())
                        .heartbeatIntervalSec(device.getHeartbeatIntervalSec())
                        .imageWidth(device.getImageWidth())
                        .imageHeight(device.getImageHeight())
                        .imageQuality(device.getImageQuality())
                        .maxUploadSizeMb(device.getMaxUploadSizeMb())
                        .allowedImageTypes(resolveAllowedTypes(device))
                        .offlineStorageLimit(device.getOfflineStorageLimit())
                        .timezone(timezone)
                        .serverTime(OffsetDateTime.now(zoneId).toString())
                        .mqtt(DeviceMqttData.builder()
                                .brokerUrl(mqttBrokerUrl)
                                .clientId("device-" + device.getDeviceId())
                                .username(mqttUsername)
                                .password(mqttPassword)
                                .tlsEnabled(mqttTlsEnabled)
                                .qos(mqttQos)
                                .commandTopic("device/" + device.getDeviceId() + "/cmd")
                                .ackTopic("device/" + device.getDeviceId() + "/ack")
                                .heartbeatTopic("device/" + device.getDeviceId() + "/heartbeat")
                                .errorTopic("device/" + device.getDeviceId() + "/error")
                                .build())
                        .build()
        );
    }

    public ApiResponse<DeviceUploadData> uploadAttendance(Authentication authentication,
                                                          String requestDeviceId,
                                                          String capturedAt,
                                                          String uploadRequestId,
                                                          MultipartFile imageFile) throws IOException {
        Device device = getAuthenticatedDevice(authentication);
        validateDeviceOwnership(device, requestDeviceId);

        if (imageFile == null || imageFile.isEmpty()) {
            throw new DeviceApiException(400, "IMAGE_FILE_MISSING", "업로드할 이미지 파일이 존재하지 않습니다.");
        }

        String normalizedUploadRequestId = normalizeUploadRequestId(uploadRequestId);
        if (normalizedUploadRequestId != null
                && deviceCaptureRepository.existsByDeviceAndUploadRequestId(device, normalizedUploadRequestId)) {
            throw new DeviceApiException(409, "DUPLICATE_UPLOAD_REQUEST", "이미 처리된 업로드 요청입니다.");
        }

        String extension = getExtension(imageFile.getOriginalFilename());
        List<String> allowedTypes = resolveAllowedTypes(device);
        if (!allowedTypes.contains(extension.toLowerCase())) {
            throw new DeviceApiException(400, "INVALID_IMAGE_TYPE", "업로드 가능한 이미지 형식이 아닙니다.");
        }

        long maxBytes = device.getMaxUploadSizeMb().longValue() * 1024L * 1024L;
        if (imageFile.getSize() > maxBytes) {
            throw new DeviceApiException(400, "FILE_SIZE_EXCEEDED", "업로드 가능한 이미지 크기를 초과했습니다.");
        }

        OffsetDateTime capturedDateTime = parseOffsetDateTime(capturedAt, "INVALID_CAPTURED_AT");
        LocalDateTime localCapturedAt = capturedDateTime
                .atZoneSameInstant(ZoneId.of(resolveTimezone(device)))
                .toLocalDateTime();

        LectureSession lectureSession = lectureSessionRepository
                .findCurrentSessionByClassroomAndTime(device.getClassroom(), localCapturedAt)
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "LECTURE_NOT_FOUND",
                        "해당 시점에 진행 중인 강의 정보를 찾을 수 없습니다."
                ));

        String storedPath = storeFile(device, imageFile, extension, localCapturedAt);

        DeviceCapture capture = DeviceCapture.builder()
                .device(device)
                .lectureSession(lectureSession)
                .uploadRequestId(normalizedUploadRequestId)
                .storedFilePath(storedPath)
                .originalFileName(imageFile.getOriginalFilename() == null
                        ? "capture." + extension
                        : imageFile.getOriginalFilename())
                .fileSize(imageFile.getSize())
                .capturedAt(localCapturedAt)
                .build();

        deviceCaptureRepository.save(capture);

        boolean inInitialTenMinutes = isInInitialTenMinutes(lectureSession, localCapturedAt);

        boolean hasPendingStreamEvent = streamEventRepository.existsPendingEvent(
                device.getDeviceId(),
                lectureSession.getSessionId(),
                localCapturedAt
        );

        boolean shouldRunRekognition = inInitialTenMinutes || hasPendingStreamEvent;

        if (shouldRunRekognition) {
            streamEventRepository.markProcessedBeforeCapture(
                    device.getDeviceId(),
                    lectureSession.getSessionId(),
                    localCapturedAt,
                    LocalDateTime.now()
            );

            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    faceRecognitionService.recognizeAsync(capture.getCaptureId());
                }
            });
        } else {
            capture.setProcessingStatus(DeviceProcessingStatus.DONE);
            capture.setRecognizedCount(0);
            capture.setUnrecognizedCount(0);
            capture.setProcessedAt(LocalDateTime.now());
        }

        return ApiResponse.success(
                201,
                DeviceUploadData.builder()
                        .captureId(capture.getCaptureId())
                        .processingStatus(capture.getProcessingStatus().name())
                        .build(),
                "출석 이미지가 정상적으로 접수되었습니다."
        );
    }

    @Transactional(readOnly = true)
    public ApiResponse<DeviceUploadResultData> getUploadResult(Authentication authentication, Long captureId) {
        Device device = getAuthenticatedDevice(authentication);
        DeviceCapture capture = deviceCaptureRepository.findByCaptureIdAndDevice(captureId, device)
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "UPLOAD_NOT_FOUND",
                        "업로드한 이미지 정보를 찾을 수 없습니다."
                ));

        return ApiResponse.success(
                200,
                DeviceUploadResultData.builder()
                        .captureId(capture.getCaptureId())
                        .processingStatus(capture.getProcessingStatus().name())
                        .recognizedCount(capture.getRecognizedCount())
                        .unrecognizedCount(capture.getUnrecognizedCount())
                        .processedAt(capture.getProcessedAt() == null
                                ? null
                                : capture.getProcessedAt().atOffset(ZoneOffset.ofHours(9)).toString())
                        .build()
        );
    }

    @Transactional
    public ActionResponse heartbeat(Authentication authentication, DeviceHeartbeatRequest request) {
        Device device = getAuthenticatedDevice(authentication);
        validateDeviceOwnership(device, request.getDeviceId());

        device.setCameraStatus(request.getCameraStatus());
        device.setNetworkStatus(request.getNetworkStatus());
        device.setLastHeartbeatAt(parseOffsetDateTime(request.getSentAt(), "INVALID_STATUS_FORMAT").toLocalDateTime());

        if (device.getDeviceStatus() == DeviceStatus.REGISTERED) {
            device.setDeviceStatus(DeviceStatus.ACTIVE);
        }

        return ActionResponse.success(200, "장치 상태가 정상적으로 전송되었습니다.");
    }

    public ActionResponse saveLog(Authentication authentication, DeviceLogRequest request) {
        Device device = getAuthenticatedDevice(authentication);
        validateDeviceOwnership(device, request.getDeviceId());

        DeviceErrorLog log = DeviceErrorLog.builder()
                .device(device)
                .errorCode(request.getErrorCode())
                .message(request.getMessage())
                .createdAt(parseOffsetDateTime(request.getCreatedAt(), "INVALID_LOG_FORMAT").toLocalDateTime())
                .build();

        deviceErrorLogRepository.save(log);
        return ActionResponse.success(200, "장치 로그가 저장되었습니다.");
    }

    private Device getAuthenticatedDevice(Authentication authentication) {
        String deviceId = ensureAuthenticated(authentication);
        return deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "DEVICE_NOT_FOUND",
                        "장치 정보를 찾을 수 없습니다."
                ));
    }

    private String ensureAuthenticated(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new DeviceApiException(401, "AUTH_REQUIRED", "로그인이 필요한 서비스입니다.");
        }

        return authentication.getName();
    }

    private void validateDeviceOwnership(Device device, String requestDeviceId) {
        if (!device.getDeviceId().equals(requestDeviceId)) {
            throw new DeviceApiException(
                    403,
                    "DEVICE_ID_MISMATCH",
                    "인증된 장치 정보와 요청 장치 정보가 일치하지 않습니다."
            );
        }
    }

    private OffsetDateTime parseOffsetDateTime(String value, String errorCode) {
        try {
            return OffsetDateTime.parse(value);
        } catch (DateTimeParseException e) {
            String message = switch (errorCode) {
                case "INVALID_CAPTURED_AT" -> "촬영 시각 형식이 올바르지 않습니다.";
                case "INVALID_STATUS_FORMAT" -> "상태 정보 형식이 올바르지 않습니다.";
                case "INVALID_LOG_FORMAT" -> "로그 정보 형식이 올바르지 않습니다.";
                default -> "시간 형식이 올바르지 않습니다.";
            };

            throw new DeviceApiException(400, errorCode, message);
        }
    }

    private List<String> resolveAllowedTypes(Device device) {
        String allowedImageTypes = device.getAllowedImageTypes();
        if (allowedImageTypes == null || allowedImageTypes.isBlank()) {
            allowedImageTypes = "jpg,jpeg,png";
        }

        return Arrays.stream(allowedImageTypes.split(","))
                .map(String::trim)
                .filter(type -> !type.isBlank())
                .map(String::toLowerCase)
                .toList();
    }

    private String resolveTimezone(Device device) {
        String timezone = device.getTimezone();
        if (timezone == null || timezone.isBlank()) {
            timezone = defaultTimezone;
        }

        try {
            ZoneId.of(timezone);
            return timezone;
        } catch (Exception e) {
            return defaultTimezone;
        }
    }

    private String normalizeUploadRequestId(String uploadRequestId) {
        if (uploadRequestId == null || uploadRequestId.isBlank()) {
            return null;
        }

        return uploadRequestId.trim();
    }

    private String storeFile(Device device,
                             MultipartFile imageFile,
                             String extension,
                             LocalDateTime capturedAt) throws IOException {
        Path baseDir = Paths.get(
                deviceUploadPath,
                device.getDeviceId(),
                String.valueOf(capturedAt.getYear()),
                String.format("%02d", capturedAt.getMonthValue()),
                String.format("%02d", capturedAt.getDayOfMonth())
        );

        Files.createDirectories(baseDir);

        String fileName = UUID.randomUUID() + "." + extension;
        Path targetPath = baseDir.resolve(fileName);

        Files.copy(imageFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return targetPath.toString();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }

        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private boolean isInInitialTenMinutes(LectureSession lectureSession, LocalDateTime capturedAt) {
        LocalDateTime sessionStart = lectureSession.getSessionStart();

        if (sessionStart == null) {
            return false;
        }

        LocalDateTime initialEnd = sessionStart.plusMinutes(10);

        return !capturedAt.isBefore(sessionStart) && !capturedAt.isAfter(initialEnd);
    }

    private String generateDeviceSecret() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(32);

        for (int i = 0; i < 32; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }

        return sb.toString();
    }

    @Transactional
    public void heartbeatFromMqtt(DeviceHeartbeatRequest request) {
        Device device = deviceRepository.findByDeviceId(request.getDeviceId())
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "DEVICE_NOT_FOUND",
                        "장치 정보를 찾을 수 없습니다."
                ));

        device.setCameraStatus(request.getCameraStatus());
        device.setNetworkStatus(request.getNetworkStatus());
        device.setLastHeartbeatAt(parseOffsetDateTime(request.getSentAt(), "INVALID_STATUS_FORMAT").toLocalDateTime());

        if (device.getDeviceStatus() == DeviceStatus.REGISTERED) {
            device.setDeviceStatus(DeviceStatus.ACTIVE);
        }
    }

    @Transactional
    public void saveErrorFromMqtt(DeviceErrorMqttRequest request) {
        Device device = deviceRepository.findByDeviceId(request.getDeviceId())
                .orElseThrow(() -> new DeviceApiException(
                        404,
                        "DEVICE_NOT_FOUND",
                        "장치 정보를 찾을 수 없습니다."
                ));

        DeviceErrorLog errorLog = DeviceErrorLog.builder()
                .device(device)
                .errorCode(request.getErrorCode())
                .message(request.getMessage())
                .createdAt(parseOffsetDateTime(request.getCreatedAt(), "INVALID_LOG_FORMAT").toLocalDateTime())
                .build();

        deviceErrorLogRepository.save(errorLog);
    }

    @Transactional
    public void saveAckFromMqtt(DeviceAckMqttRequest request) {
        if (deviceCommandAckRepository.existsByCommandIdAndDeviceId(
                request.getCommandId(),
                request.getDeviceId()
        )) {
            return;
        }

        DeviceCommandAck ack = DeviceCommandAck.builder()
                .commandId(request.getCommandId())
                .commandType(request.getCommandType())
                .lectureId(request.getLectureId())
                .deviceId(request.getDeviceId())
                .result(request.getResult())
                .message(request.getMessage())
                .processedAt(parseOffsetDateTime(request.getProcessedAt(), "INVALID_ACK_FORMAT").toLocalDateTime())
                .build();

        deviceCommandAckRepository.save(ack);
    }

    @Transactional
    public void sendStartCaptureCommand(String deviceId,
                                        Long lectureId,
                                        String classroom,
                                        Integer captureIntervalSec) {
        DeviceCommandMqttRequest request = DeviceCommandMqttRequest.builder()
                .commandId("cmd-" + System.currentTimeMillis())
                .commandType("START_CAPTURE")
                .lectureId(lectureId)
                .classroom(classroom)
                .captureIntervalSec(captureIntervalSec)
                .issuedAt(OffsetDateTime.now().toString())
                .build();

        String topic = "device/" + deviceId + "/cmd";
        deviceCommandPublisher.publishCommand(topic, request);
    }

    @Transactional
    public void sendStopCaptureCommand(String deviceId,
                                       Long lectureId,
                                       String classroom) {
        DeviceCommandMqttRequest request = DeviceCommandMqttRequest.builder()
                .commandId("cmd-" + System.currentTimeMillis())
                .commandType("STOP_CAPTURE")
                .lectureId(lectureId)
                .classroom(classroom)
                .issuedAt(OffsetDateTime.now().toString())
                .build();

        String topic = "device/" + deviceId + "/cmd";
        deviceCommandPublisher.publishCommand(topic, request);
    }
}