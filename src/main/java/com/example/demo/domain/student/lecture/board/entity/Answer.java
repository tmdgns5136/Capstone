package com.example.demo.domain.student.lecture.board.entity;

import com.example.demo.domain.professor.entity.Professor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ANSWER_ID")
    private Long id;

    @Lob
    @Column(name = "ANSWER_CONTENT", columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreatedDate
    @Column(name = "ANSWER_CREATED_AT", updatable = false)
    private LocalDateTime answerCreated;

    @LastModifiedDate
    @Column(name = "ANSWER_MODIFIED_AT")
    private LocalDateTime answerModified;

    // 질문 게시판과의 연관 관계 (1:1)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonIgnore
    private QuestionBoard question;

    // 답변을 작성한 교수님과의 연관 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    @JsonIgnore
    private Professor professor;

}
