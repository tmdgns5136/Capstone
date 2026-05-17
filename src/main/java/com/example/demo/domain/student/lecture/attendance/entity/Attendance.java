package com.example.demo.domain.student.lecture.attendance.entity;

import com.example.demo.domain.enumerate.AttendStatus;
import com.example.demo.domain.enumerate.StudentClassStatus;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "ATTENDANCE")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ATTENDANCE_ID", unique = true, nullable = false)
    private Long attendanceId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "ATTEND_STATUS", length = 20, nullable = false)
    private AttendStatus attendStatus = AttendStatus.TBD;

    @Enumerated(EnumType.STRING)
    private StudentClassStatus studentClassStatus; // 새로운 실시간 상태 (착석 / 자리비움)

    @Column(name = "CHECK_TIME")
    private LocalDateTime checkTime;

    @Column(name = "ENTER_TIME")
    private LocalDateTime enterTime;

    @Column(name = "EXIT_TIME")
    private LocalDateTime exitTime;

    @Column(name = "STAY_RATE")
    private Double stayRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SESSION_ID")
    private LectureSession lectureSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID")
    @JsonIgnore
    private Student student;
}