package com.example.demo.domain.professor.repository;

import com.example.demo.domain.professor.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    public Professor findByProfessorNum(String professorNum);
    public Boolean existsByProfessorNum(String professorNum);
    public Boolean existsByProfessorEmail(String professorEmail);
    public Professor findByProfessorEmail(String professorEmail);
}
