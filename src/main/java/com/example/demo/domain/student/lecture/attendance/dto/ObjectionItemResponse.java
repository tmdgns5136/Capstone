package com.example.demo.domain.student.lecture.attendance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ObjectionItemResponse {

    private final Long objectionId;
    private final String studentId;
    private final String studentName;
    private final String course;
    private final String date;
    private final String reason;
    private final Long sessionId;
    private final String status;

}