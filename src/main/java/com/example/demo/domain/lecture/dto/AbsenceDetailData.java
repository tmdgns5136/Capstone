package com.example.demo.domain.lecture.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AbsenceDetailData {
    private Long requestId;
    private String title;
    private String reason;
    private String status;
    private String requestData;
    private Long sessionId;
    private String evidenceFileUrl;
}
