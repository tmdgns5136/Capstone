package com.example.demo.domain.lecture.attendance.entity;

import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.Lecture;
import com.example.demo.domain.lecture.entity.LectureSession;
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
@Table(name = "ATTENDANCE_OBJECTION")
public class Objection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OBJECTION_ID", unique = true, nullable = false)
    private Long objectionId;

    @Column(name = "OBJECTION_TITLE", nullable = false)
    private String objectionTitle;

    @Lob
    @Column(name = "OBJECTION_REASON", nullable = false, columnDefinition = "TEXT")
    private String objectionReason;

    @Column(name = "EVIDENCE_FILE", nullable = false)
    private String evidencePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "OBJECTION_STATUS", length = 20, nullable = false)
    private Status status = Status.PENDING;

    @Lob
    @Column(name = "REJECTED_REASON", columnDefinition = "TEXT")
    private String rejectedReason;

    @CreatedDate
    @Column(name = "OBJECTION_CREATED_AT")
    private LocalDateTime objectionCreated;

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

    @ManyToOne(fetch = FetchType.LAZY) // 여러 공결 신청이 하나의 수업 세션에 해당할 수 있음
    @JoinColumn(name = "SESSION_ID")
    @JsonIgnore
    private LectureSession lectureSession;

}
