package com.example.demo.domain.appeal.dto;

public class ProcessAppealRequest {

    private String status;
    private String rejectReason;

    public ProcessAppealRequest() {
    }

    public String getStatus() {
        return status;
    }

    public String getRejectReason() {
        return rejectReason;
    }
}