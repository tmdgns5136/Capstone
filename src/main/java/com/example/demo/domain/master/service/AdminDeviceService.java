package com.example.demo.domain.master.service;

import com.example.demo.domain.device.dto.DeviceRegisterData;
import com.example.demo.domain.device.dto.DeviceRegisterRequest;
import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.entity.DeviceErrorLog;
import com.example.demo.domain.device.enumerate.CameraStatus;
import com.example.demo.domain.device.enumerate.NetworkStatus;
import com.example.demo.domain.device.repository.DeviceErrorLogRepository;
import com.example.demo.domain.device.repository.DeviceRepository;
import com.example.demo.domain.device.service.DeviceService;
import com.example.demo.domain.enumerate.RoleType;
import com.example.demo.domain.master.dto.device.AdminDeviceConfigData;
import com.example.demo.domain.master.dto.device.AdminDeviceData;
import com.example.demo.domain.master.dto.device.AdminDeviceErrorLogData;
import com.example.demo.domain.master.dto.device.AdminPasswordCheckRequest;
import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.master.repository.MasterRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDeviceService {

    private final MasterRepository masterRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceErrorLogRepository deviceErrorLogRepository;
    private final DeviceService deviceService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public ApiResponse<List<AdminDeviceData>> getDevices(Authentication authentication) {
        ensureMaster(authentication);

        List<AdminDeviceData> devices = deviceRepository
                .findAll(Sort.by(Sort.Direction.ASC, "classroom", "deviceId"))
                .stream()
                .map(this::toDeviceData)
                .toList();

        return ApiResponse.success(200, devices);
    }

    @Transactional
    public ApiResponse<DeviceRegisterData> registerDevice(Authentication authentication, DeviceRegisterRequest request) {
        ensureMaster(authentication);
        return deviceService.register(request);
    }

    public ActionResponse checkPassword(Authentication authentication, AdminPasswordCheckRequest request) {
        Master master = ensureMaster(authentication);
        String currentPassword = request == null ? null : request.getCurrentPassword();

        if (currentPassword == null || !passwordEncoder.matches(currentPassword, master.getMasterPassword())) {
            throw new CustomException(401, "비밀번호가 일치하지 않습니다.");
        }

        return ActionResponse.success(200, "비밀번호 확인이 완료되었습니다.");
    }

    private Master ensureMaster(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new CustomException(401, "로그인이 필요한 서비스입니다.");
        }

        Master master = masterRepository.findByMasterNum(authentication.getName());
        if (master == null) {
            throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");
        }

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "관리자 권한이 필요합니다.");
        }

        return master;
    }

    private AdminDeviceData toDeviceData(Device device) {
        List<AdminDeviceErrorLogData> errorLogs = deviceErrorLogRepository
                .findByDeviceOrderByCreatedAtDesc(device)
                .stream()
                .map(this::toErrorLogData)
                .toList();

        return AdminDeviceData.builder()
                .deviceId(device.getDeviceId())
                .classroom(device.getClassroom())
                .deviceName(device.getDeviceName())
                .deviceSecret(device.getDeviceSecret())
                .deviceStatus(device.getDeviceStatus() == null ? null : device.getDeviceStatus().name())
                .loggedIn(isOnline(device))
                .uptime(formatUptime(device.getCreatedAt()))
                .lastHeartbeat(formatLastHeartbeat(device.getLastHeartbeatAt()))
                .cameraStatus(resolveCameraStatus(device).name())
                .networkStatus(resolveNetworkStatus(device).name())
                .config(AdminDeviceConfigData.builder()
                        .active(device.isActive())
                        .captureIntervalSec(device.getCaptureIntervalSec())
                        .heartbeatIntervalSec(device.getHeartbeatIntervalSec())
                        .commandPollIntervalSec(device.getCommandPollIntervalSec())
                        .imageWidth(device.getImageWidth())
                        .imageHeight(device.getImageHeight())
                        .imageQuality(device.getImageQuality())
                        .maxUploadSizeMb(device.getMaxUploadSizeMb())
                        .allowedImageTypes(device.getAllowedImageTypes())
                        .offlineStorageLimit(device.getOfflineStorageLimit())
                        .timezone(device.getTimezone())
                        .build())
                .errorLogs(errorLogs)
                .build();
    }

    private AdminDeviceErrorLogData toErrorLogData(DeviceErrorLog log) {
        return AdminDeviceErrorLogData.builder()
                .id(log.getId())
                .errorCode(log.getErrorCode())
                .message(log.getMessage())
                .createdAt(log.getCreatedAt() == null
                        ? "-"
                        : log.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }

    private boolean isOnline(Device device) {
        if (!device.isActive() || device.getLastHeartbeatAt() == null) {
            return false;
        }

        long graceSeconds = Math.max(60, device.getHeartbeatIntervalSec() * 3L);
        return !device.getLastHeartbeatAt().isBefore(LocalDateTime.now().minusSeconds(graceSeconds))
                && resolveNetworkStatus(device) != NetworkStatus.OFFLINE;
    }

    private CameraStatus resolveCameraStatus(Device device) {
        return device.getCameraStatus() == null ? CameraStatus.DISCONNECTED : device.getCameraStatus();
    }

    private NetworkStatus resolveNetworkStatus(Device device) {
        return device.getNetworkStatus() == null ? NetworkStatus.OFFLINE : device.getNetworkStatus();
    }

    private String formatUptime(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "-";
        }

        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long days = duration.toDays();
        long hours = duration.toHoursPart();
        long minutes = duration.toMinutesPart();

        if (days > 0) {
            return days + "일 " + hours + "시간";
        }
        if (hours > 0) {
            return hours + "시간 " + minutes + "분";
        }
        return Math.max(0, minutes) + "분";
    }

    private String formatLastHeartbeat(LocalDateTime lastHeartbeatAt) {
        if (lastHeartbeatAt == null) {
            return "-";
        }

        Duration duration = Duration.between(lastHeartbeatAt, LocalDateTime.now());
        long seconds = Math.max(0, duration.toSeconds());
        if (seconds < 10) {
            return "방금 전";
        }
        if (seconds < 60) {
            return seconds + "초 전";
        }
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + "분 전";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + "시간 전";
        }
        return (hours / 24) + "일 전";
    }
}
