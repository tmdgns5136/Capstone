package com.attendance.attendancesystem.domain.absence.dto;

import java.util.List;

public class AbsenceListResponse {

    private final List<AbsenceItemResponse> data;
    private final long totalElements;
    private final int totalPages;

    public AbsenceListResponse(List<AbsenceItemResponse> data, long totalElements, int totalPages) {
        this.data = data;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<AbsenceItemResponse> getData() {
        return data;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }
}