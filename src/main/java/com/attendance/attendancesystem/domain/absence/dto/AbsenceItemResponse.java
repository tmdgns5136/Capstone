package com.attendance.attendancesystem.domain.absence.dto;

public class AbsenceItemResponse {

    private final Long absenceId;
    private final String studentId;
    private final String studentName;
    private final String course;
    private final String date;
    private final String reason;
    private final String requestDate;
    private final String status;
    private final boolean hasDocument;
    private final String fileName;

    public AbsenceItemResponse(
            Long absenceId,
            String studentId,
            String studentName,
            String course,
            String date,
            String reason,
            String requestDate,
            String status,
            boolean hasDocument,
            String fileName
    ) {
        this.absenceId = absenceId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.course = course;
        this.date = date;
        this.reason = reason;
        this.requestDate = requestDate;
        this.status = status;
        this.hasDocument = hasDocument;
        this.fileName = fileName;
    }

    public Long getAbsenceId() {
        return absenceId;
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

    public boolean isHasDocument() {
        return hasDocument;
    }

    public String getFileName() {
        return fileName;
    }
}