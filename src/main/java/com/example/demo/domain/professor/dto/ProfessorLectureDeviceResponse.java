package com.example.demo.domain.professor.dto;

public class ProfessorLectureDeviceResponse {

    private final String deviceId;
    private final String classroom;
    private final String deviceName;
    private final String streamUrl;
    private final String yoloStreamUrl;

    public ProfessorLectureDeviceResponse(
            String deviceId,
            String classroom,
            String deviceName,
            String streamUrl,
            String yoloStreamUrl
    ) {
        this.deviceId = deviceId;
        this.classroom = classroom;
        this.deviceName = deviceName;
        this.streamUrl = streamUrl;
        this.yoloStreamUrl = yoloStreamUrl;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getClassroom() {
        return classroom;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getStreamUrl() {
        return streamUrl;
    }

    public String getYoloStreamUrl() {
        return yoloStreamUrl;
    }
}
