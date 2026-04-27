package com.example.demo.domain.board.repository;

import com.example.demo.domain.entity.board.QuestionBoard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionBoardRepository extends JpaRepository<QuestionBoard, Long> {
    Page<QuestionBoard> findByLecture_LectureId(Long lectureId, Pageable pageable);
}