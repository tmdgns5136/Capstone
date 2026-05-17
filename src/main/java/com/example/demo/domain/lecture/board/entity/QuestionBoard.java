package com.example.demo.domain.lecture.board.entity;


import com.example.demo.domain.lecture.entity.Lecture;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.home.entity.user.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "QUESTION_BOARD")
public class QuestionBoard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "QUESTION_ID", unique = true, nullable = false)
    private Long questionId;

    @Column(name = "QUESTION_TITLE", length = 255, nullable = false)
    private String questionTitle;

    @Lob
    @Column(name = "QUESTION_CONTEXT", nullable = false, columnDefinition = "TEXT")
    private String questionContext;

    @Lob
    @Column(name = "QUESTION_ANSWER", columnDefinition = "TEXT")
    private String questionAnswer;

    @Column(name = "QUESTION_PRIVATE", nullable = false)
    private Boolean questionPrivate;

    @CreatedDate
    @Column(name = "QUESTION_CREATED_AT", updatable = false)
    private LocalDateTime questionCreated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    private Lecture lecture;
}
