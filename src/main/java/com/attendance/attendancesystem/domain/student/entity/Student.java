package com.attendance.attendancesystem.domain.student.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_number", nullable = false, unique = true)
    private String studentNumber;

    @Column(name = "name", nullable = false)
    private String name;

    protected Student() {
    }

    public Student(String studentNumber, String name) {
        this.studentNumber = studentNumber;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public String getName() {
        return name;
    }
}