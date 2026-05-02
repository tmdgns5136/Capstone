package com.example.demo.domain.lecture.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AbsenceRequest {
    private String studentNum;
    private Long sessionId;
    private String title;
    private String reason;
    private String filePath;
}
