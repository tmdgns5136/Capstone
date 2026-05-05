package com.example.demo.domain.student.notification.service;

import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.notification.dto.NotificationData;
import com.example.demo.domain.student.notification.dto.NotificationRead;
import com.example.demo.domain.student.notification.entity.Notification;
import com.example.demo.domain.student.notification.repository.NotificationRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;

    public ApiResponse<List<NotificationData>> getNotifications(Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        List<Notification> notifications = notificationRepository.findByStudent(student);

        List<NotificationData> notificationData = notifications.stream().map(notification ->
                NotificationData.builder().id(notification.getNotificationId())
                        .type(notification.getNoticeType().getCode())
                        .message(notification.getMessage())
                        .relatedId(notification.getRelatedId())
                        .isRead(notification.isRead())
                        .createdAt(notification.getNotificationCreated().toString()).build()).toList();

        return ApiResponse.success(200, notificationData);
    }

    public ApiResponse<NotificationRead> readNotification(Authentication authentication, Long notificationId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Notification notification = notificationRepository.findById(notificationId).orElseThrow(() -> new CustomException(404, "존재하지 않는 알림입니다."));

        if (!notification.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new CustomException(403, "해당 알림에 대한 접근 권한이 없습니다.");
        }


        notification.setRead(true);
        String url = "";
        Long lectureId;
        Long relatedId = notification.getRelatedId();
        switch(notification.getNoticeType().getCode()) {
            case "NOTICE":
                lectureId = notification.getLecture().getLectureId();
                url = "api/mylecture/" + lectureId + "/notices/" + relatedId;
                break;
            case "ANSWER":
                lectureId = notification.getLecture().getLectureId();
                url = "api/mylecture/" + lectureId + "/questions/" + relatedId;
                break;
            case "ABSENCE_OFFICIAL":
                lectureId = notification.getLecture().getLectureId();
                url = "api/mylecture/" + lectureId + "/official-requests/" + relatedId;
                break;
            case "ABSENCE_OBJECTION":
                lectureId = notification.getLecture().getLectureId();
                url = "api/mylecture/" + lectureId + "/objection-requests/" + relatedId;
                break;
            case "PHOTO_RESULT":
                url = "api/mypage";
                break;

        }
        Notification newNotification = notificationRepository.save(notification);
        NotificationRead notificationRead = NotificationRead.builder().isRead(true).redirectUrl(url).build();

        return ApiResponse.success(200, notificationRead);
    }
}
