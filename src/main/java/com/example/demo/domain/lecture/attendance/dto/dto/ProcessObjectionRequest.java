package com.example.demo.domain.lecture.attendance.dto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessObjectionRequest {
    private String status;
    private String rejectReason;
}