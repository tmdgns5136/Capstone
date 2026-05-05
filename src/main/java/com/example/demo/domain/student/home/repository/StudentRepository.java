package com.example.demo.domain.student.home.repository;

import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.enumerate.StudentStatus;
import com.example.demo.domain.student.home.entity.user.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    public Student findByStudentNum(String studentNum);
    public Boolean existsByStudentNum(String studentNum);
    public Boolean existsByStudentEmail(String studentEmail);
    public Student findByStudentEmail(String studentEmail);

    Page<Student> findAllByStudentStatusNot(StudentStatus status, Pageable pageable);
}
