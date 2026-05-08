package com.example.demo.domain.student.notification.repository;

import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    public List<Notification> findByStudent(Student student);
    public List<Notification> findByMaster(Master master);
    public List<Notification> findByRelatedId(String relatedId);
}
