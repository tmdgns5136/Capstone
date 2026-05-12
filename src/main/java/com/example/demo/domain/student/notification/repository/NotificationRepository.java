package com.example.demo.domain.student.notification.repository;

import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByStudent(Student student);

    List<Notification> findByMaster(Master master);

    List<Notification> findByRelatedId(String relatedId);
}