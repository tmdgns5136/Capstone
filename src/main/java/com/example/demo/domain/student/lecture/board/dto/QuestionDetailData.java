package com.example.demo.domain.student.lecture.board.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class QuestionDetailData {
    private Long questionId;
    private String title;
    private String content;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private String createdDate;
    private Long views;
    private QuestionAnswer answer;
}
