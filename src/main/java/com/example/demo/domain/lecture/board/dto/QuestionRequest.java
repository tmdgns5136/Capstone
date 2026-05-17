package com.example.demo.domain.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionRequest {
    private String title;
    private String content;
    private boolean isPrivate;
}
