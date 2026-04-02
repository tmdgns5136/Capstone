package com.attendance.attendancesystem.domain.lecture.repository;

import com.attendance.attendancesystem.domain.lecture.entity.Lecture;
import com.attendance.attendancesystem.domain.lecture.entity.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface LectureSessionRepository extends JpaRepository<LectureSession, Long> {

    Optional<LectureSession> findByLectureAndSessionDate(Lecture lecture, LocalDate sessionDate);
}