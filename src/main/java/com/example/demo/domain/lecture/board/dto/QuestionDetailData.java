package com.example.demo.domain.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuestionDetailData {
    private Long questionId;
    private String studentNum;
    private String title;
    private boolean isPrivate;
    private boolean inAnswered;
    private LocalDateTime createdDate;
}
