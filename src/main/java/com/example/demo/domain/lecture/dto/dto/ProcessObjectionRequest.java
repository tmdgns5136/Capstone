package com.example.demo.domain.lecture.dto.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProcessObjectionRequest {

    private String status;
    private String rejectReason;

}