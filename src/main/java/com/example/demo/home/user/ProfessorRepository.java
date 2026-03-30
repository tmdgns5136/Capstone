package com.example.demo.home.user;

import com.example.demo.home.entity.user.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    public Professor findByProfessorNum(String professorNum);
    public Boolean existsByProfessorNum(String professorNum);
    public Boolean existsByProfessorEmail(String professorEmail);
    public Professor findByProfessorEmail(String professorEmail);
}
