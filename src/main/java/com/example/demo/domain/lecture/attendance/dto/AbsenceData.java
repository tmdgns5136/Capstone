package com.example.demo.domain.lecture.attendance.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AbsenceData {
    private Long requestId;
    private String status;
}
