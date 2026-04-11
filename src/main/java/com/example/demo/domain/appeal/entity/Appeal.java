package com.example.demo.domain.appeal.entity;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "appeals")
public class Appeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appeal_date", nullable = false)
    private LocalDate appealDate;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppealStatus status;

    @Column(name = "reject_reason")
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    protected Appeal() {
    }

    public Appeal(
            LocalDate appealDate,
            String reason,
            LocalDate requestDate,
            AppealStatus status,
            String rejectReason,
            Student student,
            Lecture lecture
    ) {
        this.appealDate = appealDate;
        this.reason = reason;
        this.requestDate = requestDate;
        this.status = status;
        this.rejectReason = rejectReason;
        this.student = student;
        this.lecture = lecture;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getAppealDate() {
        return appealDate;
    }

    public String getReason() {
        return reason;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public AppealStatus getStatus() {
        return status;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public Student getStudent() {
        return student;
    }

    public Lecture getLecture() {
        return lecture;
    }

    public void updateStatus(AppealStatus status, String rejectReason) {
        this.status = status;
        this.rejectReason = rejectReason;
    }
}