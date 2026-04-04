package com.example.demo.domain.lecture.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LectureData{
    private String lectureId;
    private String lectureName;
    private String professorName;
}
