package com.example.demo.domain.student.lecture.attendance.repository;

import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.lecture.attendance.entity.Attendance;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByLectureSession_LectureAndStudent(
            Lecture lecture,
            Student student
    );

    List<Attendance> findByLectureSessionIn(
            List<LectureSession> lectureSessions
    );

    Optional<Attendance> findByLectureSessionAndStudent(
            LectureSession lectureSession,
            Student student
    );
}