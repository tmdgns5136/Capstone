package com.example.demo.domain.lecture.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LectureTimeTable {
    private String lectureCode;
    private String lectureName;
    private String day;
    private String startTime;
    private String endTime;
    private String room;
}
