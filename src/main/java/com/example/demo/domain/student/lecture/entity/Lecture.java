package com.example.demo.domain.student.lecture.entity;

import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.student.lecture.attendance.entity.Objection;
import com.example.demo.domain.student.lecture.attendance.entity.Official;
import com.example.demo.domain.student.lecture.board.entity.NoticeBoard;
import com.example.demo.domain.student.lecture.board.entity.QuestionBoard;
import com.example.demo.domain.student.notification.entity.Notification;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(
        name = "LECTURE",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_lecture_unique_set",
                        columnNames = {
                                "LECTURE_CODE",
                                "LECTURE_YEAR",
                                "LECTURE_SEMESTER",
                                "lecture_division"
                        }
                )
        }
)
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LECTURE_ID", unique = true, nullable = false)
    private Long lectureId;

    @Column(name = "LECTURE_CODE", length = 10, nullable = false)
    private String lectureCode;

    @Column(name = "LECTURE_NAME", length = 30, nullable = false)
    private String lectureName;

    @Column(name = "LECTURE_ROOM", length = 10, nullable = false)
    private String lectureRoom;

    @Column(name = "LECTURE_YEAR", nullable = false)
    private Long lectureYear;

    @Column(name = "LECTURE_SEMESTER", length = 10, nullable = false)
    private String lectureSemester;

    @Column(name = "lecture_division", length = 5, nullable = false)
    private String lectureDivision;

    @Column(name = "lecture_start", nullable = false)
    private String lectureStart;

    @Column(name = "lecture_end", nullable = false)
    private String lectureEnd;

    @Column(name = "lecture_day", nullable = false)
    private String lectureDay;

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LectureSession> lectureSessions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Enrollment> enrollments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NoticeBoard> notices = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionBoard> questions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Official> officials = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Objection> objections = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lecture", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    @JsonIgnore
    private Professor professor;
}