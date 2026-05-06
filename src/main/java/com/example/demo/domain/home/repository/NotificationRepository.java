package com.example.demo.domain.home.repository;

import com.example.demo.domain.home.entity.etc.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverNumOrderByNoticeCreatedDesc(String receiverNum);
}