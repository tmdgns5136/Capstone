package com.example.demo.domain.student.lecture.board.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {
    private String title;
    private String content;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
}
