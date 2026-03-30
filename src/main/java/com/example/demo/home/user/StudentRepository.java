package com.example.demo.home.user;

import com.example.demo.home.entity.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    public Student findByStudentNum(String studentNum);
    public Boolean existsByStudentNum(String studentNum);
    public Boolean existsByStudentEmail(String studentEmail);
    public Student findByStudentEmail(String studentEmail);
}
