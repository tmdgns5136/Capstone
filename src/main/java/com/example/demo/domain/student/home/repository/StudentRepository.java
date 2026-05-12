package com.example.demo.domain.student.home.repository;

import com.example.demo.domain.student.home.entity.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    public Student findByStudentNum(String studentNum);
    public Boolean existsByStudentNum(String studentNum);
    public Boolean existsByStudentEmail(String studentEmail);
    public Student findByStudentEmail(String studentEmail);
}
