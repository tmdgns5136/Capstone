package com.example.demo.domain.master.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseStudent {
    private Long studentId;
    private String studentNum;
    private String studentName;
}
