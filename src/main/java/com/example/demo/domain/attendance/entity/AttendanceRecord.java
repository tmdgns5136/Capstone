package com.example.demo.domain.attendance.entity;

import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "attendance_records",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "lecture_id", "attendance_date", "semester"})
        }
)
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "semester", nullable = false)
    private String semester;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    protected AttendanceRecord() {
    }

    public AttendanceRecord(LocalDate attendanceDate, String semester, AttendanceStatus status, Student student, Lecture lecture) {
        this.attendanceDate = attendanceDate;
        this.semester = semester;
        this.status = status;
        this.student = student;
        this.lecture = lecture;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public String getSemester() {
        return semester;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public Student getStudent() {
        return student;
    }

    public Lecture getLecture() {
        return lecture;
    }

    public void updateStatus(AttendanceStatus status) {
        this.status = status;
    }
}