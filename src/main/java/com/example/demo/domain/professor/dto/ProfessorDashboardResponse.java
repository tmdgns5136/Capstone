package com.example.demo.domain.professor.dto;

public class ProfessorDashboardResponse {

    private final int totalStudents;
    private final double avgAttendance;
    private final int pendingAbsences;
    private final int todayClasses;

    public ProfessorDashboardResponse(int totalStudents, double avgAttendance, int pendingAbsences, int todayClasses) {
        this.totalStudents = totalStudents;
        this.avgAttendance = avgAttendance;
        this.pendingAbsences = pendingAbsences;
        this.todayClasses = todayClasses;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public double getAvgAttendance() {
        return avgAttendance;
    }

    public int getPendingAbsences() {
        return pendingAbsences;
    }

    public int getTodayClasses() {
        return todayClasses;
    }
}