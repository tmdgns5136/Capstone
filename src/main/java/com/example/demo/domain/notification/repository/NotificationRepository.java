package com.example.demo.domain.notification.repository;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    public List<Notification> findByStudent(Student student);
}
