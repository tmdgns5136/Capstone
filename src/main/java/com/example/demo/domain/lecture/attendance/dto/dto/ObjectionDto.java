package com.example.demo.domain.lecture.attendance.dto.dto;

import com.example.demo.domain.enumerate.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ObjectionDto {
    private Long objectionId;
    private String objectionTitle;
    private String objectionReason;
    private String evidencePath;
    private Status status;
    private String rejectedReason;
    private Long sessionId;
    private LocalDateTime objectionCreated;
}
