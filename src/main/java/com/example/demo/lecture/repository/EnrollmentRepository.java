package com.example.demo.lecture.repository;

import com.example.demo.home.entity.user.Student;
import com.example.demo.lecture.entity.Enrollment;
import com.example.demo.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    public List<Enrollment> findByStudent(Student student);
}
