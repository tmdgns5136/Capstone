package com.example.demo.domain.attendance.dto;

import java.util.List;

public class AttendanceMonitoringResponse {

    private final int attendance;
    private final int late;
    private final int away;
    private final int absent;
    private final List<AttendanceStudentResponse> students;

    public AttendanceMonitoringResponse(
            int attendance,
            int late,
            int away,
            int absent,
            List<AttendanceStudentResponse> students
    ) {
        this.attendance = attendance;
        this.late = late;
        this.away = away;
        this.absent = absent;
        this.students = students;
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