package com.example.demo.entity.attendance;

import com.example.demo.entity.enumerate.AttendStatus;
import com.example.demo.entity.enumerate.Status;
import com.example.demo.entity.user.Professor;
import com.example.demo.entity.user.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
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
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    private Professor professor;

}
