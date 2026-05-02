package com.example.demo.domain.lecture.attendance.dto.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OfficialListResponse {
    private final List<OfficialItemResponse> data;
    private final long totalElements;
    private final int totalPages;

}