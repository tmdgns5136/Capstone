package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // 기존에 있던 개수 세기 메서드
    int countByLecture_LectureId(Long lectureId);
    
    List<Enrollment> findByLecture_LectureId(Long lectureId);
    
    public List<Enrollment> findByStudent(Student student);
}
