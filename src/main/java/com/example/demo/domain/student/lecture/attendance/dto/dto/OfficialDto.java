package com.example.demo.domain.student.lecture.attendance.dto.dto;

import com.example.demo.domain.enumerate.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OfficialDto {
    private Long officialId;
    private String officialTitle;
    private String officialReason;
    private String evidencePath;
    private Status status;
    private String rejectedReason;
    private Long sessionId;
    private LocalDateTime officialCreated;
}
