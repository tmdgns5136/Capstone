package com.example.demo.domain.student.lecture.repository;

import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.lecture.board.entity.NoticeBoard;
import com.example.demo.domain.student.lecture.entity.Enrollment;
import com.example.demo.domain.student.lecture.entity.Lecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // 기존에 있던 개수 세기 메서드
    int countByLecture_LectureId(Long lectureId);
    
    List<Enrollment> findByLecture_LectureId(Long lectureId);
    
    public List<Enrollment> findByStudent(Student student);

    public Enrollment findByStudentAndLecture(Student student, Lecture lecture);

    Page<Enrollment> findByLecture_LectureId(Long lectureId, Pageable pageable);
}
