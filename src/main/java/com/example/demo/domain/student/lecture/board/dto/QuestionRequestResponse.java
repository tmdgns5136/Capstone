package com.example.demo.domain.student.lecture.board.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionRequestResponse {
    private Long questionId;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
}
