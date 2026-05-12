package com.example.demo.domain.student.lecture.repository;

import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LectureSessionRepository extends JpaRepository<LectureSession, Long> {
    Optional<LectureSession> findByLectureAndScheduledAt(Lecture lecture, LocalDate scheduledAt);
    public List<LectureSession> findByLecture(Lecture lecture);
}
