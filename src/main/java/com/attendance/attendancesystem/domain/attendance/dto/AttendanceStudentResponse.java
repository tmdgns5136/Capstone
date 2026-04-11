package com.attendance.attendancesystem.domain.attendance.dto;

public class AttendanceStudentResponse {

    private final String studentId;
    private final String name;
    private final int present;
    private final int late;
    private final int absent;
    private final int total;
    private final double rate;

    public AttendanceStudentResponse(String studentId, String name, int present, int late, int absent, int total, double rate) {
        this.studentId = studentId;
        this.name = name;
        this.present = present;
        this.late = late;
        this.absent = absent;
        this.total = total;
        this.rate = rate;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getName() {
        return name;
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
}