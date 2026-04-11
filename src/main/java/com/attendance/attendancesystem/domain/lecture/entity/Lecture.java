package com.attendance.attendancesystem.domain.lecture.entity;

import com.attendance.attendancesystem.domain.professor.entity.Professor;
import jakarta.persistence.*;

@Entity
@Table(name = "lectures")
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lecture_code", nullable = false, unique = true)
    private String lectureCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "room", nullable = false)
    private String room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    protected Lecture() {
    }

    public Lecture(String lectureCode, String name, String room, Professor professor) {
        this.lectureCode = lectureCode;
        this.name = name;
        this.room = room;
        this.professor = professor;
    }

    public Long getId() {
        return id;
    }

    public String getLectureCode() {
        return lectureCode;
    }

    public String getName() {
        return name;
    }

    public String getRoom() {
        return room;
    }

    public Professor getProfessor() {
        return professor;
    }
}