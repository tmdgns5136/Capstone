package com.attendance.attendancesystem.domain.professor.repository;

import com.attendance.attendancesystem.domain.professor.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    public Professor findByProfessorNum(String professorNum);
}
