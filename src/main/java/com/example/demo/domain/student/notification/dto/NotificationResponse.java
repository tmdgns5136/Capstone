package com.example.demo.domain.student.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class NotificationResponse {

    private Long notificationId;
    private String type;
    private String message;
    private Long relatedId;
    private boolean isRead;
    private String createdAt;
}