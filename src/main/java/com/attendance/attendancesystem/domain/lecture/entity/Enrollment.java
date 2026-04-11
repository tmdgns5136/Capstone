package com.attendance.attendancesystem.domain.lecture.entity;

import com.attendance.attendancesystem.domain.student.entity.Student;
import jakarta.persistence.*;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    protected Enrollment() {
    }

    public Enrollment(Lecture lecture, Student student) {
        this.lecture = lecture;
        this.student = student;
    }

    public Long getId() {
        return id;
    }

    public Lecture getLecture() {
        return lecture;
    }

    public Student getStudent() {
        return student;
    }
}