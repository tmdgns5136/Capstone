package com.example.demo.domain.lecture.board.entity;

import com.example.demo.domain.lecture.entity.Lecture;
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
@Table(name = "NOTICE_BOARD")
public class NoticeBoard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTICE_ID", unique = true, nullable = false)
    private Long noticeId;

    @Column(name = "NOTICE_TITLE", length = 255, nullable = false)
    private String noticeTitle;

    @Lob
    @Column(name = "NOTICE_CONTEXT", nullable = false, columnDefinition = "TEXT")
    private String noticeContext;

    @Builder.Default
    @Column(name = "NOTICE_VIEWS")
    private Long noticeViews = 0L;

    @CreatedDate
    @Column(name = "NOTICE_CREATED_AT", updatable = false)
    private LocalDateTime noticeCreated;

    @LastModifiedDate
    @Column(name = "NOTICE_MODIFIED_AT")
    private LocalDateTime noticeModified;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    @JsonIgnore
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    @JsonIgnore
    private Lecture lecture;
}
