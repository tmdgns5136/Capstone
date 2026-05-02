package com.example.demo.domain.lecture.board.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {
    private String title;
    private String content;
    private boolean isPrivate;
}
