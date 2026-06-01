package com.example.demo.domain.attendance.dto;

import java.util.List;

public class AttendanceMonitoringResponse {

    private String date;
    private Long sessionNum;
    private String sessionStatus;

    private int attendance;
    private int late;
    private int away;
    private int absent;

    private List<AttendanceStudentResponse> students;

    public AttendanceMonitoringResponse(
            String date,
            Long sessionNum,
            String sessionStatus,
            int attendance,
            int late,
            int away,
            int absent,
            List<AttendanceStudentResponse> students
    ) {
        this.date = date;
        this.sessionNum = sessionNum;
        this.sessionStatus = sessionStatus;
        this.attendance = attendance;
        this.late = late;
        this.away = away;
        this.absent = absent;
        this.students = students;
    }

    public String getDate() {
        return date;
    }

    public Long getSessionNum() {
        return sessionNum;
    }

    public String getSessionStatus() {
        return sessionStatus;
    }

    public int getAttendance() {
        return attendance;
    }

    public int getLate() {
        return late;
    }

    public int getAway() {
        return away;
    }

    public int getAbsent() {
        return absent;
    }

    public List<AttendanceStudentResponse> getStudents() {
        return students;
    }
}