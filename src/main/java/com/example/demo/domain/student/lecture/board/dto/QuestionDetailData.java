package com.example.demo.domain.student.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class QuestionDetailData {
    private Long questionId;
    private String title;
    private String content;
    private boolean isPrivate;
    private String createdDate;
    private Long views;
    private QuestionAnswer answer;
}
