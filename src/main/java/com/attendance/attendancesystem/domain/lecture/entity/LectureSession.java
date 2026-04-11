package com.attendance.attendancesystem.domain.lecture.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "lecture_sessions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"lecture_id", "session_date"})
        }
)
public class LectureSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LectureSessionStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    protected LectureSession() {
    }

    public static LectureSession create(Lecture lecture, LocalDate sessionDate) {
        LectureSession session = new LectureSession();
        session.lecture = lecture;
        session.sessionDate = sessionDate;
        session.status = LectureSessionStatus.NOT_STARTED;
        return session;
    }

    public void start() {
        this.status = LectureSessionStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }

    public void end() {
        this.status = LectureSessionStatus.ENDED;
        this.endedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public LectureSessionStatus getStatus() {
        return status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public Lecture getLecture() {
        return lecture;
    }
}