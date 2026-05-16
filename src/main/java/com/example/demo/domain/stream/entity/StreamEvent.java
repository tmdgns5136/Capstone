package com.example.demo.domain.stream.entity;

import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "STREAM_EVENT")
public class StreamEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EVENT_ID")
    private Long eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEVICE_ID_PK", nullable = false)
    private Device device;

    @Column(name = "DEVICE_KEY", nullable = false, length = 100)
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SESSION_ID", nullable = false)
    private LectureSession lectureSession;

    @Enumerated(EnumType.STRING)
    @Column(name = "EVENT_TYPE", nullable = false, length = 20)
    private StreamEventType eventType;

    @Column(name = "BEFORE_COUNT", nullable = false)
    private Integer beforeCount;

    @Column(name = "AFTER_COUNT", nullable = false)
    private Integer afterCount;

    @Column(name = "DIFF_COUNT", nullable = false)
    private Integer diffCount;

    @Column(name = "EVENT_TIME", nullable = false)
    private LocalDateTime eventTime;

    @Column(name = "RECOGNITION_PROCESSED", nullable = false)
    private Boolean recognitionProcessed = false;

    @Column(name = "PROCESSED_AT")
    private LocalDateTime processedAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    public StreamEvent() {
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.recognitionProcessed == null) {
            this.recognitionProcessed = false;
        }
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public LectureSession getLectureSession() {
        return lectureSession;
    }

    public void setLectureSession(LectureSession lectureSession) {
        this.lectureSession = lectureSession;
    }

    public StreamEventType getEventType() {
        return eventType;
    }

    public void setEventType(StreamEventType eventType) {
        this.eventType = eventType;
    }

    public Integer getBeforeCount() {
        return beforeCount;
    }

    public void setBeforeCount(Integer beforeCount) {
        this.beforeCount = beforeCount;
    }

    public Integer getAfterCount() {
        return afterCount;
    }

    public void setAfterCount(Integer afterCount) {
        this.afterCount = afterCount;
    }

    public Integer getDiffCount() {
        return diffCount;
    }

    public void setDiffCount(Integer diffCount) {
        this.diffCount = diffCount;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }

    public Boolean getRecognitionProcessed() {
        return recognitionProcessed;
    }

    public void setRecognitionProcessed(Boolean recognitionProcessed) {
        this.recognitionProcessed = recognitionProcessed;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}