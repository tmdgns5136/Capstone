package com.example.demo.domain.lecture.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SessionData {
    private Long sessionId;
    private Long sessionNum;
    private String sessionDate;
    private String startTime;
    private String endTime;
    private String status;
}
