package com.example.demo.domain.attendance.dto;

public class UpdateAttendanceRequest {

    private String studentId;
    private String lectureId;
    private String status;

    public UpdateAttendanceRequest() {
    }

    public String getStudentId() {
        return studentId;
    }

    public String getLectureId() {
        return lectureId;
    }

    public String getStatus() {
        return status;
    }
}