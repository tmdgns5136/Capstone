package com.example.demo.domain.recognition.entity;

import com.example.demo.domain.device.entity.DeviceCapture;
import com.example.demo.domain.student.home.entity.user.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "FACE_RECOGNITION_RESULT",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_face_result_capture_student",
                        columnNames = {"CAPTURE_ID", "STUDENT_ID"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceRecognitionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RESULT_ID")
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CAPTURE_ID", nullable = false)
    private DeviceCapture capture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Column(name = "STUDENT_NUM", nullable = false, length = 20)
    private String studentNum;

    @Column(name = "SIMILARITY", nullable = false)
    private Float similarity;

    @Column(name = "RECOGNIZED_AT", nullable = false)
    private LocalDateTime recognizedAt;

    @PrePersist
    public void prePersist() {
        if (recognizedAt == null) {
            recognizedAt = LocalDateTime.now();
        }
    }
}
