package com.example.demo.domain.student.lecture.attendance.dto;

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