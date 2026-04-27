package com.example.demo.domain.lecture.entity.lecture;

import com.example.demo.domain.entity.board.NoticeBoard;
import com.example.demo.domain.entity.board.QuestionBoard;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.lecture.entity.attendance.Objection;
import com.example.demo.domain.lecture.entity.attendance.Official;
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
// 복합 제약조건
@Table(name = "LECTURE", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_lecture_unique_set",
                // 클래스 내부 필드명과 일치해야 함
                columnNames = {"LECTURE_CODE", "LECTURE_YEAR", "LECTURE_SEMESTER", "lecture_division"}
        )
})
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID")
    private Professor professor;
}
