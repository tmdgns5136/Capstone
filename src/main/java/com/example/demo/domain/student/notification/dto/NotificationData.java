package com.example.demo.domain.student.notification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationData {
    private Long id;
    private String type;
    private String message;
    private String relatedId;
    private boolean isRead;
    private String createdAt;
}
