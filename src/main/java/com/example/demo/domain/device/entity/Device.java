package com.example.demo.domain.device.entity;

import com.example.demo.domain.device.enumerate.CameraStatus;
import com.example.demo.domain.device.enumerate.DeviceStatus;
import com.example.demo.domain.device.enumerate.NetworkStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DEVICE", uniqueConstraints = {
        @UniqueConstraint(name = "uk_device_device_id", columnNames = "DEVICE_KEY")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DEVICE_ID_PK")
    private Long id;

    @Column(name = "DEVICE_KEY", nullable = false, length = 100)
    private String deviceId;

    @Column(name = "DEVICE_SECRET", nullable = false, length = 255)
    private String deviceSecret;

    @Column(name = "CLASSROOM", nullable = false, length = 50)
    private String classroom;

    @Column(name = "DEVICE_NAME", nullable = false, length = 100)
    private String deviceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "DEVICE_STATUS", nullable = false, length = 20)
    @Builder.Default
    private DeviceStatus deviceStatus = DeviceStatus.REGISTERED;

    @Column(name = "ACTIVE", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "CAPTURE_INTERVAL_SEC", nullable = false)
    @Builder.Default
    private Integer captureIntervalSec = 60;

    @Column(name = "HEARTBEAT_INTERVAL_SEC", nullable = false)
    @Builder.Default
    private Integer heartbeatIntervalSec = 30;

    @Column(name = "COMMAND_POLL_INTERVAL_SEC", nullable = false)
    @Builder.Default
    private Integer commandPollIntervalSec = 10;

    @Column(name = "IMAGE_WIDTH", nullable = false)
    @Builder.Default
    private Integer imageWidth = 4608;

    @Column(name = "IMAGE_HEIGHT", nullable = false)
    @Builder.Default
    private Integer imageHeight = 2592;

    @Column(name = "IMAGE_QUALITY", nullable = false)
    @Builder.Default
    private Integer imageQuality = 100;

    @Column(name = "MAX_UPLOAD_SIZE_MB", nullable = false)
    @Builder.Default
    private Integer maxUploadSizeMb = 30;

    @Column(name = "ALLOWED_IMAGE_TYPES", nullable = false, length = 100)
    @Builder.Default
    private String allowedImageTypes = "jpg,jpeg,png";

    @Column(name = "OFFLINE_STORAGE_LIMIT", nullable = false)
    @Builder.Default
    private Integer offlineStorageLimit = 500;

    @Column(name = "TIMEZONE", nullable = false, length = 50)
    @Builder.Default
    private String timezone = "Asia/Seoul";

    @Enumerated(EnumType.STRING)
    @Column(name = "CAMERA_STATUS", length = 20)
    private CameraStatus cameraStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "NETWORK_STATUS", length = 20)
    private NetworkStatus networkStatus;

    @Column(name = "LAST_HEARTBEAT_AT")
    private LocalDateTime lastHeartbeatAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
