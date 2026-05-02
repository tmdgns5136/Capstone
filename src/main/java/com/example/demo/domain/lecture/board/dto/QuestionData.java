package com.example.demo.domain.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuestionData {
    private Long questionId;
    private String studentNum;
    private String title;
    private boolean isPrivate;
    private boolean isAnswered;
    private String createdDate;
}
