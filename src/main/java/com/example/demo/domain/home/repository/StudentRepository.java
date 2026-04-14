package com.example.demo.domain.home.repository;

import com.example.demo.domain.home.entity.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    public Student findByStudentNum(String studentNum);
    public Boolean existsByStudentNum(String studentNum);
    public Boolean existsByStudentEmail(String studentEmail);
    public Student findByStudentEmail(String studentEmail);
}
