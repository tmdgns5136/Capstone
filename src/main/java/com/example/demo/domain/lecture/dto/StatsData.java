package com.example.demo.domain.lecture.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StatsData {
    private Long totalSessions;
    private Long attendance;
    private Long absence;
    private Long late;
    private Double attendanceRate;
    private List<SessionData> sessions;
}
