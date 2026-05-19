package com.example.demo.domain.device.entity;

import com.example.demo.domain.device.enumerate.DeviceProcessingStatus;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "DEVICE_CAPTURE",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_device_capture_device_upload_request",
                        columnNames = {"DEVICE_ID_PK", "UPLOAD_REQUEST_ID"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceCapture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CAPTURE_ID")
    private Long captureId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEVICE_ID_PK", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SESSION_ID")
    private LectureSession lectureSession;

    @Column(name = "UPLOAD_REQUEST_ID", length = 100)
    private String uploadRequestId;

    @Column(name = "STORED_FILE_PATH", nullable = false, length = 500)
    private String storedFilePath;

    @Column(name = "ORIGINAL_FILE_NAME", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "FILE_SIZE", nullable = false)
    private Long fileSize;

    @Column(name = "CAPTURED_AT", nullable = false)
    private LocalDateTime capturedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "PROCESSING_STATUS", nullable = false, length = 20)
    @Builder.Default
    private DeviceProcessingStatus processingStatus = DeviceProcessingStatus.PENDING;

    @Column(name = "RECOGNIZED_COUNT")
    @Builder.Default
    private Integer recognizedCount = 0;

    @Column(name = "UNRECOGNIZED_COUNT")
    @Builder.Default
    private Integer unrecognizedCount = 0;

    @Column(name = "PROCESSED_AT")
    private LocalDateTime processedAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
