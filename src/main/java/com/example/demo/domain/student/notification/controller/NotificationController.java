package com.example.demo.domain.student.notification.controller;

import com.example.demo.domain.student.notification.dto.NotificationReadResponse;
import com.example.demo.domain.student.notification.dto.NotificationResponse;
import com.example.demo.domain.student.notification.service.NotificationService;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications(Authentication authentication) {
        return notificationService.getNotifications(authentication);
    }

    @PatchMapping("/{notificationId}/read")
    public ApiResponse<NotificationReadResponse> readNotification(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        return notificationService.readNotification(notificationId, authentication);
    }
}