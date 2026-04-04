package com.example.demo.domain.lecture.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OfficialRequestData {
    private Long requestId;
    private String title;
    private String status;
    private String requestDate;
}
