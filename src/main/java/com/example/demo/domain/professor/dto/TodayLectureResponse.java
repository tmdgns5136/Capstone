package com.example.demo.domain.professor.dto;

public class TodayLectureResponse {

    private final String lectureId;
    private final String name;
    private final String location;
    private final String time;
    private final String status;

    public TodayLectureResponse(String lectureId, String name, String location, String time, String status) {
        this.lectureId = lectureId;
        this.name = name;
        this.location = location;
        this.time = time;
        this.status = status;
    }

    public String getLectureId() {
        return lectureId;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getTime() {
        return time;
    }

    public String getStatus() {
        return status;
    }
}