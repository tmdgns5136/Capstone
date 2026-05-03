package com.example.demo.domain.student.lecture.entity;

import com.example.demo.domain.enumerate.SessionStatus;
import com.example.demo.domain.student.lecture.attendance.entity.Attendance;
import com.example.demo.domain.student.lecture.attendance.entity.Objection;
import com.example.demo.domain.student.lecture.attendance.entity.Official;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Builder
@Table(name = "LECTURE_SESSION")
public class LectureSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SESSION_ID", unique = true, nullable = false)
    private Long sessionId;

    @Column(name = "SESSION_NUM", nullable = false)
    private Long sessionNum;

    @Column(name = "SCHEDULED_AT", nullable = false)
    private LocalDate scheduledAt;

    @Column(name = "SESSION_START", nullable = false)
    private LocalDateTime sessionStart;

    @Column(name = "SESSION_END")
    private LocalDateTime sessionEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "Session_Status", length = 20, nullable = false)
    private SessionStatus status = SessionStatus.NOT_STARTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    @JsonIgnore
    private Lecture lecture;

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL)
    private List<Attendance> attendances = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL)
    private List<Official> officials = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL)
    private List<Objection> objections = new ArrayList<>();
}
