package com.example.demo.domain.appeal.dto;

public class AppealItemResponse {

    private final Long appealId;
    private final String studentId;
    private final String studentName;
    private final String course;
    private final String date;
    private final String reason;
    private final String requestDate;
    private final String status;

    public AppealItemResponse(
            Long appealId,
            String studentId,
            String studentName,
            String course,
            String date,
            String reason,
            String requestDate,
            String status
    ) {
        this.appealId = appealId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.course = course;
        this.date = date;
        this.reason = reason;
        this.requestDate = requestDate;
        this.status = status;
    }

    public Long getAppealId() {
        return appealId;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getCourse() {
        return course;
    }

    public String getDate() {
        return date;
    }

    public String getReason() {
        return reason;
    }

    public String getRequestDate() {
        return requestDate;
    }

    public String getStatus() {
        return status;
    }
}