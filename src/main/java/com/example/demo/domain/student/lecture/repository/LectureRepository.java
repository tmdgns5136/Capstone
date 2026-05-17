package com.example.demo.domain.student.lecture.repository;

import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.student.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findByProfessor(Professor professor);

    List<Lecture> findByProfessor_ProfessorId(Long professorId);

    boolean existsByLectureCode(String lectureCode);

    Optional<Lecture> findByLectureCodeAndProfessor_ProfessorId(
            String lectureCode,
            Long professorId
    );
}