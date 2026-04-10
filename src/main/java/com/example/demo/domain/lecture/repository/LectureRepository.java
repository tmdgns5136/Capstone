package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.home.entity.user.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    public List<Lecture> findByProfessor(Professor professor);

}
