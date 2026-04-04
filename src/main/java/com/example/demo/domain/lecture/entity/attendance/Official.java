package com.example.demo.domain.lecture.entity.attendance;

import com.example.demo.domain.entity.enumerate.Status;
import com.example.demo.domain.home.entity.user.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import com.example.demo.domain.lecture.entity.lecture.LectureSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "ATTENDANCE_OFFICIAL")
public class Official {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OFFICIAL_ID", unique = true, nullable = false)
    private Long officialId;

    @Column(name = "OFFICIAL_TITLE", nullable = false)
    private String officialTitle;

    @Lob
    @Column(name = "OFFICIAL_REASON", nullable = false, columnDefinition = "TEXT")
    private String officialReason;

    @Column(name = "EVIDENCE_FILE", nullable = false)
    private String evidencePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "OFFICIAL_STATUS", length = 20, nullable = false)
    private Status status = Status.PENDING;

    @Lob
    @Column(name = "REJECTED_REASON", columnDefinition = "TEXT")
    private String rejectedReason;

    @CreatedDate
    @Column(name = "OFFICIAL_CREATED_AT")
    private LocalDateTime officialCreated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY) // 여러 공결 신청이 하나의 수업 세션에 해당할 수 있음
    @JoinColumn(name = "SESSION_ID")
    private LectureSession lectureSession;
}
