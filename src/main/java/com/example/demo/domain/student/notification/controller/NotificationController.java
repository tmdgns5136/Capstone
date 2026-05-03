package com.example.demo.domain.student.notification.controller;

import com.example.demo.domain.student.notification.dto.NotificationData;
import com.example.demo.domain.student.notification.dto.NotificationRead;
import com.example.demo.domain.student.notification.service.NotificationService;
import com.example.demo.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@Tag(name = "NotificationController", description = "This is an Notification controller")
public class NotificationController {
    private final NotificationService notificationService;

    // 알림 조회
    @Operation(summary = "알림 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationData>>> getNotifications(Authentication authentication){
        ApiResponse<List<NotificationData>> apiResponse = notificationService.getNotifications(authentication);
        return ResponseEntity.ok(apiResponse);
    }

    // 알림 읽기
    @Operation(summary = "알림 읽기")
    @PatchMapping("/{notification_id}/read")
    public ResponseEntity<ApiResponse<NotificationRead>> readNotification(Authentication authentication,@PathVariable("notification_id") Long notificationId){
        ApiResponse<NotificationRead> apiResponse = notificationService.readNotification(authentication, notificationId);
        return ResponseEntity.ok(apiResponse);
    }
}
