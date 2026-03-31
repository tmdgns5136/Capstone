package com.example.demo.lecture.repository;

import com.example.demo.home.entity.user.Professor;
import com.example.demo.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    public List<Lecture> findByProfessor(Professor professor);
}
