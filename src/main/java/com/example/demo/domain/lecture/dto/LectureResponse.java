package com.example.demo.domain.lecture.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class LectureResponse {
    private Integer status;
    private Boolean success;
    private List<LectureData> data;

    @Data
    @AllArgsConstructor
    @Builder
    public static class LectureData{
        private String lectureId;
        private String lectureName;
        private String professorName;
    }
}
