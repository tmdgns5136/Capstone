package com.example.demo.entity.board;

import com.example.demo.entity.lecture.Lecture;
import com.example.demo.home.entity.user.Professor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
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

    @CreatedDate
    @Column(name = "NOTICE_CREATED_AT", updatable = false)
    private LocalDateTime noticeCreated;

    @LastModifiedDate
    @Column(name = "NOTICE_MODIFIED_AT")
    private LocalDateTime noticeModified;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    private Lecture lecture;
}
