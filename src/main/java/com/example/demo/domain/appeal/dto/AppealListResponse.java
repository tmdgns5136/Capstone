package com.example.demo.domain.appeal.dto;

import java.util.List;

public class AppealListResponse {

    private final List<AppealItemResponse> data;
    private final long totalElements;
    private final int totalPages;

    public AppealListResponse(List<AppealItemResponse> data, long totalElements, int totalPages) {
        this.data = data;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<AppealItemResponse> getData() {
        return data;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }
}