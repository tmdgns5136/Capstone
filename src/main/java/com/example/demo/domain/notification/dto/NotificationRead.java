package com.example.demo.domain.notification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationRead {
    private boolean isRead;
    private String redirectUrl;
}
