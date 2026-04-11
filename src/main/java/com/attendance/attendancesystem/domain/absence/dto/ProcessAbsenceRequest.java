package com.attendance.attendancesystem.domain.absence.dto;

public class ProcessAbsenceRequest {

    private String status;
    private String rejectReason;

    public ProcessAbsenceRequest() {
    }

    public String getStatus() {
        return status;
    }

    public String getRejectReason() {
        return rejectReason;
    }
}