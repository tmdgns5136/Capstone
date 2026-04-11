package com.attendance.attendancesystem.domain.absence.entity;

import com.attendance.attendancesystem.domain.lecture.entity.Lecture;
import com.attendance.attendancesystem.domain.student.entity.Student;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "absence_requests")
public class AbsenceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "absence_date", nullable = false)
    private LocalDate absenceDate;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AbsenceRequestStatus status;

    @Column(name = "has_document", nullable = false)
    private boolean hasDocument;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "reject_reason")
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    protected AbsenceRequest() {
    }

    public AbsenceRequest(
            LocalDate absenceDate,
            String reason,
            LocalDate requestDate,
            AbsenceRequestStatus status,
            boolean hasDocument,
            String fileName,
            String filePath,
            String rejectReason,
            Student student,
            Lecture lecture
    ) {
        this.absenceDate = absenceDate;
        this.reason = reason;
        this.requestDate = requestDate;
        this.status = status;
        this.hasDocument = hasDocument;
        this.fileName = fileName;
        this.filePath = filePath;
        this.rejectReason = rejectReason;
        this.student = student;
        this.lecture = lecture;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getAbsenceDate() {
        return absenceDate;
    }

    public String getReason() {
        return reason;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public AbsenceRequestStatus getStatus() {
        return status;
    }

    public boolean isHasDocument() {
        return hasDocument;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFilePath() {
        return filePath;
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

    public void updateStatus(AbsenceRequestStatus status, String rejectReason) {
        this.status = status;
        this.rejectReason = rejectReason;
    }
}