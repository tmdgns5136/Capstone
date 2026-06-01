package com.example.demo.domain.master.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PhotoComplete {
    private String studentName;
    private String studentNum;
    private String accessDate;
    private String status;
    private String rejectReason;
}
