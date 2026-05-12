package com.example.demo.domain.student.notification.repository;

import com.example.demo.domain.student.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverNumOrderByNoticeCreatedDesc(String receiverNum);
}