package com.example.demo.domain.lecture.attendance.repository;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.attendance.entity.Official;
import com.example.demo.domain.lecture.entity.Lecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfficialRepository extends JpaRepository<Official, Long> {
    public List<Official> findByStudentAndLecture(Student student, Lecture lecture);

    public Page<Official> Professor_ProfessorId(Long professorId, Pageable pageable);
}
