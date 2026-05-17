package com.example.demo.domain.student.home.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseData {
    private Long lectureId;
    private String lectureName;
    private String startTime;
    private String endTime;
    private String room;
}
