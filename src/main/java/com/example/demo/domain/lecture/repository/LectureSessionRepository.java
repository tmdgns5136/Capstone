package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.lecture.entity.lecture.Lecture;
import com.example.demo.domain.lecture.entity.lecture.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LectureSessionRepository extends JpaRepository<LectureSession, Long> {
    Optional<LectureSession> findByLectureAndScheduledAy(Lecture lecture, LocalDateTime scheduledAt);
    public List<LectureSession> findByLecture(Lecture lecture);
}
