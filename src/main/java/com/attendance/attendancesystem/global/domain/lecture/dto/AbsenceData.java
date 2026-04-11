package com.example.demo.domain.lecture.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AbsenceData {
    private Long requestId;
    private String status;
}
