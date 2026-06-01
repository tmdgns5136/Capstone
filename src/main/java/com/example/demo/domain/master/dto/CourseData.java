package com.example.demo.domain.master.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseData {
    private Long lectureId;
    private String lectureName;
    private String lectureCode;
    private String ProfessorName;
    private String division;
    private String lectureDay;
    private String startTime;
    private String endTime;
    private String room;
    private int studentCount;
}
