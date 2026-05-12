package com.example.demo.domain.student.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionAnswer {
    private String content;
    private String professorName;
    private String answeredDate;

}
