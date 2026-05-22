package com.example.demo.domain.student.lecture.board.repository;

import com.example.demo.domain.student.lecture.board.entity.Answer;
import com.example.demo.domain.student.lecture.board.entity.QuestionBoard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    public Answer findByQuestion(QuestionBoard questionBoard);
}
