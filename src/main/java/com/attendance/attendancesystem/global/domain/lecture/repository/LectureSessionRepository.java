package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.lecture.entity.lecture.Lecture;
import com.example.demo.domain.lecture.entity.lecture.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureSessionRepository extends JpaRepository<LectureSession, Long> {
    public List<LectureSession> findByLecture(Lecture lecture);
}
