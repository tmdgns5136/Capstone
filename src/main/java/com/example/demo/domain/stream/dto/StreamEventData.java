package com.example.demo.domain.stream.dto;

public class StreamEventData {

    private Long eventId;
    private String deviceId;
    private Long sessionId;
    private String eventType;
    private Integer beforeCount;
    private Integer afterCount;
    private Integer diffCount;
    private String eventTime;
    private Boolean recognitionProcessed;

    public StreamEventData() {
    }

    public StreamEventData(
            Long eventId,
            String deviceId,
            Long sessionId,
            String eventType,
            Integer beforeCount,
            Integer afterCount,
            Integer diffCount,
            String eventTime,
            Boolean recognitionProcessed
    ) {
        this.eventId = eventId;
        this.deviceId = deviceId;
        this.sessionId = sessionId;
        this.eventType = eventType;
        this.beforeCount = beforeCount;
        this.afterCount = afterCount;
        this.diffCount = diffCount;
        this.eventTime = eventTime;
        this.recognitionProcessed = recognitionProcessed;
    }

    public Long getEventId() {
        return eventId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public String getEventType() {
        return eventType;
    }

    public Integer getBeforeCount() {
        return beforeCount;
    }

    public Integer getAfterCount() {
        return afterCount;
    }

    public Integer getDiffCount() {
        return diffCount;
    }

    public String getEventTime() {
        return eventTime;
    }

    public Boolean getRecognitionProcessed() {
        return recognitionProcessed;
    }
}