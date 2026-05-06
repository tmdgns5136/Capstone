package com.example.demo.domain.home.controller;

import com.example.demo.domain.home.dto.notification.NotificationReadResponse;
import com.example.demo.domain.home.dto.notification.NotificationResponse;
import com.example.demo.domain.home.service.NotificationService;
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