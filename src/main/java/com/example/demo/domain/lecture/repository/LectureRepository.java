package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    public List<Lecture> findByProfessor(Professor professor);
    
    Optional<Lecture> findByLectureCodeAndProfessorId(String lectureCode, Long professorId);

}
