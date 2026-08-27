package com.example.demo.domain.student.lecture.attendance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AbsenceRequestData {
    private Long requestId;
    private String title;
    private String status;
    private String requestDate;
}
