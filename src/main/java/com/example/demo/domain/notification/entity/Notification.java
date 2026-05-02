package com.example.demo.domain.notification.entity;

import com.example.demo.domain.enumerate.NoticeType;
import com.example.demo.domain.enumerate.SessionStatus;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.Lecture;
import com.example.demo.domain.professor.entity.Professor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTIFICATION_ID", unique = true, nullable = false)
    private Long notificationId;

    @Column(name = "NOTIFICATION_MESSAGE", nullable = false)
    private String message;

    @Column(name = "NOTIFICATION_RELATED_ID", nullable = false)
    private Long relatedId;

    @Column(name = "NOTIFICATION_IS_READ", nullable = false)
    private boolean isRead;

    @CreatedDate
    @Column(name = "NOTIFICATION_CREATED_AT", updatable = false)
    private LocalDateTime notificationCreated;

    @Enumerated(EnumType.STRING)
    @Column(name = "NOTIFICATION_TYPE", length = 20, nullable = false)
    private NoticeType noticeType;

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
}
