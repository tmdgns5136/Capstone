package com.example.demo.domain.student.lecture.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NoticeDetailData {
    private Long noticeId;
    private String title;
    private String content;
    private String createdDate;
    private Long views;
}
