package com.example.demo.domain.lecture.board.repository;

import com.example.demo.domain.lecture.board.entity.QuestionBoard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionBoardRepository extends JpaRepository<QuestionBoard, Long> {
    Page<QuestionBoard> findByLecture_LectureId(Long lectureId, Pageable pageable);
}