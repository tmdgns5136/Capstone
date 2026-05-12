package com.example.demo.domain.master.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequest {
    private Long year;
    private String semester;
    private String division;
    private String lectureDay;
    private String lectureName;
    private String lectureCode;
    private String professorNum;
    private String startTime;
    private String endTime;
    private String room;
}
