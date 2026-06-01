package com.example.demo.domain.professor.dto;

public class ProfessorDashboardResponse {

    private final int totalStudents;
    private final double avgAttendance;
    private final int pendingAbsences;
    private final int pendingAppeals;
    private final int todayClasses;

    public ProfessorDashboardResponse(int totalStudents, double avgAttendance, int pendingAbsences, int pendingAppeals, int todayClasses) {
        this.totalStudents = totalStudents;
        this.avgAttendance = avgAttendance;
        this.pendingAbsences = pendingAbsences;
        this.pendingAppeals = pendingAppeals;
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

    public int getPendingAppeals() {
        return pendingAppeals;
    }

    public int getTodayClasses() {
        return todayClasses;
    }
}