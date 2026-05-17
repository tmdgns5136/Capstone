package com.example.demo.domain.lecture.board.repository;

import com.example.demo.domain.lecture.board.entity.QuestionBoard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionBoardRepository extends JpaRepository<QuestionBoard, Long> {
}
