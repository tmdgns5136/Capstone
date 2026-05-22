package com.example.demo.domain.student.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NoticeData {
    private Long noticeId;
    private String title;
    private String createdDate;

}
