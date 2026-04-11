package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.attendance.Official;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfficialRepository extends JpaRepository<Official, Long> {
    public List<Official> findByStudentAndLecture(Student student, Lecture lecture);
}
