package com.example.demo.domain.lecture.attendance.repository;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.attendance.entity.Attendance;
import com.example.demo.domain.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    public List<Attendance> findByLectureSession_LectureAndStudent(Lecture lecture, Student student);
}
