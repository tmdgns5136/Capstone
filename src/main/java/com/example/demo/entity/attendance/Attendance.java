package com.example.demo.entity.attendance;

import com.example.demo.entity.enumerate.AttendStatus;
import com.example.demo.entity.lecture.LectureSession;
import com.example.demo.entity.user.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "ATTENDANCE")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ATTENDANCE_ID", unique = true, nullable = false)
    private Long attendanceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ATTEND_STATUS", length = 20, nullable = false)
    private AttendStatus attendStatus = AttendStatus.TBD;

    @Column(name = "CHECK_TIME")
    private LocalDateTime checkTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_SESSION_ID")
    private LectureSession lectureSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID")
    private Student student;
}
