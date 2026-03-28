package com.example.demo.entity.lecture;

import com.example.demo.entity.attendance.Attendance;
import com.example.demo.entity.user.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Builder
@Table(name = "LECTURE_SESSION")
public class LectureSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SESSION_ID", unique = true, nullable = false)
    private Long sessionId;

    @Column(name = "SESSION_NUM", nullable = false)
    private Long sessionNum;

    @Column(name = "SCHEDULED_AT", nullable = false)
    private LocalDateTime scheduled_at;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LECTURE_ID")
    private Lecture lecture;

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL)
    private List<Attendance> attendances = new ArrayList<>();
}
