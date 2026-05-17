package com.example.demo.domain.student.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionRequestResponse {
    private Long questionId;
    private boolean isPrivate;
}
