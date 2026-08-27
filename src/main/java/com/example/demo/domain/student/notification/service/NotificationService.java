package com.example.demo.domain.student.notification.service;

import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.master.repository.MasterRepository;
import com.example.demo.domain.professor.entity.Professor; // 🌟 import 추가
import com.example.demo.domain.professor.repository.ProfessorRepository; // 🌟 import 추가
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.notification.dto.NotificationData;
import com.example.demo.domain.student.notification.dto.NotificationRead;
import com.example.demo.domain.student.notification.entity.Notification;
import com.example.demo.domain.student.notification.repository.NotificationRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository; // 🌟 교수 리포지토리 주입
    private final MasterRepository masterRepository;

    public ApiResponse<List<NotificationData>> getNotifications(
            Authentication authentication
    ) {
        String userNum = authentication.getName();

        // 1. 먼저 학생인지 확인
        Student student = studentRepository.findByStudentNum(userNum);

        List<Notification> notifications;
        List<NotificationData> notificationData;

        if (student != null) {
            // 학생 알림 조회
            notifications = notificationRepository.findByStudent(student);
            notificationData = notifications.stream()
                    .map(notification ->
                            NotificationData.builder()
                                    .id(notification.getNotificationId())
                                    .type(notification.getNoticeType().getCode())
                                    .message(notification.getMessage())
                                    .relatedId(notification.getRelatedId())
                                    .isRead(notification.isRead())
                                    .createdAt(notification.getNotificationCreated().toString())
                                    .lectureName(notification.getLecture() != null ? notification.getLecture().getLectureName() : null)
                                    .build()
                    ).toList();
        } else {
            // 2. 학생이 아니라면 교수인지 확인 🌟 [추가된 로직]
            Professor professor = professorRepository.findByProfessorNum(userNum);

            if (professor != null) {
                // 교수 알림 조회
                notifications = notificationRepository.findByProfessor(professor);
                notificationData = notifications.stream()
                        .map(notification ->
                                NotificationData.builder()
                                        .id(notification.getNotificationId())
                                        .type(notification.getNoticeType().getCode())
                                        .message(notification.getMessage())
                                        .relatedId(notification.getRelatedId())
                                        .isRead(notification.isRead())
                                        .createdAt(notification.getNotificationCreated().toString())
                                        .lectureName(notification.getLecture() != null ? notification.getLecture().getLectureName() : null)
                                        .build()
                        ).toList();
            } else {
                // 3. 둘 다 아니라면 관리자(Master)인지 확인
                Master master = masterRepository.findByMasterNum(userNum);

                if (master == null) {
                    throw new CustomException(404, "유저 정보를 찾을 수 없습니다.");
                }

                notifications = notificationRepository.findByMaster(master);
                notificationData = notifications.stream()
                        .map(notification ->
                                NotificationData.builder()
                                        .id(notification.getNotificationId())
                                        .type(notification.getNoticeType().getCode())
                                        .message(notification.getMessage())
                                        .relatedId(notification.getRelatedId())
                                        .isRead(notification.isRead())
                                        .createdAt(notification.getNotificationCreated().toString())
                                        .build()
                        ).toList();
            }
        }

        return ApiResponse.success(200, notificationData);
    }

    @Transactional
    public ApiResponse<NotificationRead> readNotification(
            Authentication authentication,
            Long notificationId
    ) {
        String userNum = authentication.getName();

        Student student = studentRepository.findByStudentNum(userNum);
        Professor professor = professorRepository.findByProfessorNum(userNum); // 🌟 교수 정보 로드

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(404, "존재하지 않는 알림입니다."));

        // 권한 체크 분기 수정 🌟
        if (student != null) {
            if (notification.getStudent() != null && !notification.getStudent().getStudentId().equals(student.getStudentId())) {
                throw new CustomException(403, "해당 알림에 대한 접근 권한이 없습니다.");
            }
        } else if (professor != null) {
            if (notification.getProfessor() != null &&!notification.getProfessor().getProfessorId().equals(professor.getProfessorId())) {
                throw new CustomException(403, "해당 알림에 대한 접근 권한이 없습니다.");
            }
        } else {
            Master master = masterRepository.findByMasterNum(userNum);
            if (master == null) {
                throw new CustomException(404, "유저 정보를 찾을 수 없습니다.");
            }
            if (notification.getMaster() != null &&!notification.getMaster().getMasterId().equals(master.getMasterId())) {
                throw new CustomException(403, "해당 알림에 대한 접근 권한이 없습니다.");
            }
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        String url = "";
        String relatedId = notification.getRelatedId();
        Long lectureId = notification.getLecture() != null ? notification.getLecture().getLectureId() : null;

        // 🌟 알림 클릭 시 역할(교수/학생/관리자)에 맞춰 올바른 프론트엔드 주소로 리다이렉트합니다.
        // 🌟 알려주신 프론트엔드 라우터 주소로 완벽하게 매핑했습니다.
        switch (notification.getNoticeType().getCode()) {
            case "NOTICE":
                url = (professor != null)
                        ? "/professor/courses"
                        : "/api/mylecture/" + lectureId + "/notices/" + relatedId;
                break;

            case "ANSWER":
                url = "/api/mylecture/" + lectureId + "/questions/" + relatedId;
                break;

            case "ABSENCE_OFFICIAL":
                // 🌟 공결관리 주소 매핑
                url = (professor != null)
                        ? "/professor/absence-management"
                        : "/api/mylecture/" + lectureId + "/official-requests/" + relatedId;
                break;

            case "ABSENCE_OBJECTION":
                // 🌟 이의신청 관리 주소 매핑
                url = (professor != null)
                        ? "/professor/appeal-management"
                        : "/api/mylecture/" + lectureId + "/objection-requests/" + relatedId;
                break;

            case "PHOTO_RESULT":
                url = (userNum.equals("admin")) ? "/master/dashboard" : "/api/mypage";
                break;
        }

        NotificationRead notificationRead = NotificationRead.builder()
                .isRead(true)
                .redirectUrl(url)
                .build();

        return ApiResponse.success(200, notificationRead);
    }
}