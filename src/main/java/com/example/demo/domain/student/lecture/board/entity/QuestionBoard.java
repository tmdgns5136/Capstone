package com.example.demo.domain.student.lecture.board.entity;


import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.professor.entity.Professor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
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

    @Builder.Default
    @Column(name = "QUESTION_VIEWS")
    private Long questionViews = 0L;

    @Column(name = "QUESTION_PRIVATE", nullable = false)
    private Boolean questionPrivate;

    @CreatedDate
    @Column(name = "QUESTION_CREATED_AT", updatable = false)
    private LocalDateTime questionCreated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID")
    @JsonIgnore
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    @JsonIgnore
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    @JsonIgnore
    private Lecture lecture;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL)
    private Answer answer;
}
