package com.example.demo.entity.user;

import com.example.demo.entity.attendance.Objection;
import com.example.demo.entity.attendance.Official;
import com.example.demo.entity.board.NoticeBoard;
import com.example.demo.entity.board.QuestionBoard;
import com.example.demo.entity.enumerate.RoleType;
import com.example.demo.entity.lecture.Lecture;
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
    private String professorPhoneNum;

    @Column(name = "PROFESSOR_PASSWORD", length = 100, nullable = false)
    private String professorPassword;

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
    private List<QuestionBoard> answeredQuestions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Objection> answeredObjections = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL)
    private List<Official> officials = new ArrayList<>();


}
