package com.example.demo.domain.lecture.attendance.dto.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ObjectionListResponse {
    private final List<ObjectionItemResponse> data;
    private final long totalElements;
    private final int totalPages;

}