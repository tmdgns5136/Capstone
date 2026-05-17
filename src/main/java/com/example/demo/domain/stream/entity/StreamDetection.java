package com.example.demo.domain.stream.entity;

import com.example.demo.domain.device.entity.Device;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "STREAM_DETECTION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreamDetection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DETECTION_ID")
    private Long detectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEVICE_ID_PK", nullable = false)
    private Device device;

    @Column(name = "DEVICE_KEY", nullable = false, length = 100)
    private String deviceId;

    @Column(name = "PEOPLE_COUNT", nullable = false)
    private Integer peopleCount;

    @Column(name = "TRACK_IDS", length = 255)
    private String trackIds;

    @Column(name = "DETECTED_AT", nullable = false)
    private LocalDateTime detectedAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}