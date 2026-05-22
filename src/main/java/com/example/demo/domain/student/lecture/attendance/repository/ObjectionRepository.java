package com.example.demo.domain.student.lecture.attendance.repository;

import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.lecture.attendance.entity.Objection;
import com.example.demo.domain.student.lecture.entity.Lecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjectionRepository extends JpaRepository<Objection, Long> {
    List<Objection> findByStudentAndLecture(Student student, Lecture lecture);

    Page<Objection> findByProfessor_ProfessorId(Long professorId, Pageable pageable);
}
