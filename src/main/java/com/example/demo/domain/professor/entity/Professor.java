package com.example.demo.domain.professor.entity;


import com.example.demo.domain.student.lecture.attendance.entity.Objection;
import com.example.demo.domain.student.lecture.attendance.entity.Official;
import com.example.demo.domain.enumerate.RoleType;
import com.example.demo.domain.student.lecture.board.entity.Answer;
import com.example.demo.domain.student.lecture.board.entity.NoticeBoard;
import com.example.demo.domain.student.lecture.board.entity.QuestionBoard;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.notification.entity.Notification;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "PROFESSOR")
public class Professor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PROFESSOR_ID", unique = true, nullable = false)
    private Long professorId;

    @Column(name = "PROFESSOR_NUM", length = 10, unique = true, nullable = false)
    private String professorNum;

    @Column(name = "PROFESSOR_NAME", length = 20, nullable = false)
    private String professorName;

    @Column(name = "PROFESSOR_EMAIL", length = 20, unique = true, nullable = false)
    private String professorEmail;

    @Column(name = "PROFESSOR_PHONENUM", length = 20, unique = true, nullable = false)
    private String phoneNum;

    @Column(name = "PROFESSOR_PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name = "ROLE_TYPE", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleType roleType;

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Lecture> lectures = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NoticeBoard> notices = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionBoard> Questions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Objection> answeredObjections = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL)
    private List<Official> officials = new ArrayList<>();

    @OneToOne(mappedBy = "professor", cascade = CascadeType.ALL)
    private Answer answer;

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();

}
