package com.example.demo.domain.professor.repository;

import com.example.demo.domain.enumerate.ProfessorStatus;
import com.example.demo.domain.enumerate.StudentStatus;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.student.home.entity.user.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    public Professor findByProfessorNum(String professorNum);
    public Boolean existsByProfessorNum(String professorNum);
    public Boolean existsByProfessorEmail(String professorEmail);
    public Professor findByProfessorEmail(String professorEmail);

    Page<Professor> findAllByProfessorStatusNot(ProfessorStatus status, Pageable pageable);
}
