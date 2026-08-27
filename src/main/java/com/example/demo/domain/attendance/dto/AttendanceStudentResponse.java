package com.example.demo.domain.attendance.dto;

import com.example.demo.domain.student.lecture.dto.SessionData;

import java.util.List;

public class AttendanceStudentResponse {

    private String studentId;
    private String name;
    private String status;

    private int present;
    private int late;
    private int absent;
    private int total;
    private double rate;

    private List<SessionData> sessions;

    public AttendanceStudentResponse(
            String studentId,
            String name,
            String status,
            int present,
            int late,
            int absent,
            int total,
            double rate,
            List<SessionData> sessions
    ) {
        this.studentId = studentId;
        this.name = name;
        this.status = status;
        this.present = present;
        this.late = late;
        this.absent = absent;
        this.total = total;
        this.rate = rate;
        this.sessions = sessions;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getName() {
        return name;
    }

    public String getStatus() {
        return status;
    }

    public int getPresent() {
        return present;
    }

    public int getLate() {
        return late;
    }

    public int getAbsent() {
        return absent;
    }

    public int getTotal() {
        return total;
    }

    public double getRate() {
        return rate;
    }

    public List<SessionData> getSessions() {
        return sessions;
    }
}