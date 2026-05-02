package com.example.demo.domain.lecture.attendance.repository;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.attendance.entity.Objection;
import com.example.demo.domain.lecture.entity.Lecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjectionRepository extends JpaRepository<Objection, Long> {
    public List<Objection> findByStudentAndLecture(Student student, Lecture lecture);

    public Page<Objection> findAll(Pageable pageable);
}
