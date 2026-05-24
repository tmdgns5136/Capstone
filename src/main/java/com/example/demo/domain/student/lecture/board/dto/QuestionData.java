package com.example.demo.domain.student.lecture.board.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuestionData {
    private Long questionId;
    private String studentNum;
    private String title;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    @JsonProperty("isAnswered")
    private boolean isAnswered;
    private String createdDate;
}
