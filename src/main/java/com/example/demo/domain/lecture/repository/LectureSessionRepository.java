package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.lecture.entity.lecture.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureSessionRepository extends JpaRepository<LectureSession, Long> {
}
