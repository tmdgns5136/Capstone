package com.example.demo.entity.user;

import com.example.demo.entity.attendance.Attendance;
import com.example.demo.entity.attendance.Objection;
import com.example.demo.entity.attendance.Official;
import com.example.demo.entity.board.NoticeBoard;
import com.example.demo.entity.board.QuestionBoard;
import com.example.demo.entity.enumerate.RoleType;
import com.example.demo.entity.lecture.Enrollment;
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
@Table(name = "STUDENT")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STUDENT_ID", unique = true, nullable = false)
    private Long studentId;

    @Column(name = "STUDENT_NUM", length = 10, unique = true, nullable = false)
    private String studentNum;

    @Column(name = "STUDENT_NAME", length = 20, nullable = false)
    private String studentName;

    @Column(name = "STUDENT_EMAIL", length = 30, unique = true, nullable = false)
    private String studentEmail;

    @Column(name = "STUDENT_PHONENUM", length = 20, unique = true, nullable = false)
    private String phoneNum;

    @Column(name = "STUDENT_PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name = "ROLE_TYPE", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleType roleType;

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Enrollment> enrollments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Image> images = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionBoard> questions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attendance> attendances = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Objection> objections = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Official> officials = new ArrayList<>();
}
