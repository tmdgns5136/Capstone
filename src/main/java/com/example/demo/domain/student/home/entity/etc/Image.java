package com.example.demo.domain.student.home.entity.etc;

import com.example.demo.domain.enumerate.ImagePosition;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.home.entity.user.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "IMAGE")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IMAGE_ID", unique = true, nullable = false)
    private Long imageId;

    @Column(name = "FILE_NAME", length = 100, nullable = false)
    private String fileName;

    @Column(name = "FILE_PATH", nullable = false)
    private String filePath;

    @Column(name = "FILE_TYPE", length = 100, nullable = false)
    private String fileType;

    @Column(name = "FILE_SIZE", nullable = false)
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "IMAGE_STATUS", length = 20, nullable = false)
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "IMAGE_POSITION", length = 20, nullable = false)
    private ImagePosition position;

    @Column(name = "REQUEST_ID")
    private String requestId;

    @Column(name = "REJECT_REASON")
    private String rejectReason;

    @CreatedDate
    @Column(name = "IMAGE_CREATED_AT", updatable = false)
    private LocalDateTime imageCreated;

    @LastModifiedDate
    @Column(name = "IMAGE_MODIFIED_AT")
    private LocalDateTime imageModified;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID")
    @JsonIgnore
    private Student student;
}
