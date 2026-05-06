package com.example.demo.domain.lecture.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LectureData{
    private Long lectureId;
    private String lectureCode;
    private String lectureName;
    private String professorName;
}
