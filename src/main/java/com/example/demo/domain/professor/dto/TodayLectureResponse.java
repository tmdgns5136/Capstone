package com.example.demo.domain.professor.dto;

public class TodayLectureResponse {

    private final Long lectureId;
    private final String lectureCode;
    private final String name;
    private final String location;
    private final String time;
    private final String status;
    private final Long students;

    public TodayLectureResponse(Long lectureId, String lectureCode, String name, String location, String time, String status, Long students) {
        this.lectureId = lectureId;
        this.lectureCode = lectureCode;
        this.name = name;
        this.location = location;
        this.time = time;
        this.status = status;
        this.students = students;
    }

    public Long getLectureId() {
        return lectureId;
    }

    public String getLectureCode() { return lectureCode; }

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

    public Long getStudents() { return students; }
}