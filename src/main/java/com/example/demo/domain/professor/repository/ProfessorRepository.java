package com.example.demo.domain.professor.repository;

import com.example.demo.domain.enumerate.ProfessorStatus;
import com.example.demo.domain.professor.entity.Professor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    Professor findByProfessorNum(String professorNum);

    Boolean existsByProfessorNum(String professorNum);

    Boolean existsByProfessorEmail(String professorEmail);

    Professor findByProfessorEmail(String professorEmail);

    Page<Professor> findAllByProfessorStatusNot(
            ProfessorStatus status,
            Pageable pageable
    );
}