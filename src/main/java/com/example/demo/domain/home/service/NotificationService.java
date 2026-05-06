package com.example.demo.domain.home.service;

import com.example.demo.domain.home.dto.notification.NotificationReadResponse;
import com.example.demo.domain.home.dto.notification.NotificationResponse;
import com.example.demo.domain.home.entity.etc.Notification;
import com.example.demo.domain.home.repository.NotificationRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public ApiResponse<List<NotificationResponse>> getNotifications(Authentication authentication) {
        String receiverNum = authentication.getName();

        List<NotificationResponse> data = notificationRepository
                .findByReceiverNumOrderByNoticeCreatedDesc(receiverNum)
                .stream()
                .map(notification -> NotificationResponse.builder()
                        .notificationId(notification.getNotificationId())
                        .type(notification.getNoticeType().name())
                        .message(notification.getMessage())
                        .relatedId(notification.getRelatedId())
                        .isRead(notification.isRead())
                        .createdAt(notification.getNoticeCreated().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                        .build())
                .toList();

        return ApiResponse.success(200, data);
    }

    @Transactional
    public ApiResponse<NotificationReadResponse> readNotification(
            Long notificationId,
            Authentication authentication
    ) {
        String receiverNum = authentication.getName();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(404, "알림 정보를 찾을 수 없습니다."));

        if (!notification.getReceiverNum().equals(receiverNum)) {
            throw new CustomException(403, "해당 알림에 접근할 권한이 없습니다.");
        }

        notification.setRead(true);

        NotificationReadResponse response = new NotificationReadResponse(true);

        return ApiResponse.success(200, response);
    }
}