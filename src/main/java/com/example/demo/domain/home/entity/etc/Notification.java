package com.example.demo.domain.home.entity.etc;

import com.example.demo.domain.enumerate.NoticeType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "NOTIFICATION")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTIFICATION_ID", unique = true, nullable = false)
    private Long notificationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "NOTIFICATION_TYPE", length = 20, nullable = false)
    private NoticeType noticeType;

    @Column(name = "RELATED_ID", nullable = false)
    private Long relatedId;

    @Column(name = "IS_READ", nullable = false)
    private boolean isRead;

    @Column(name = "NOTIFICATION_CREATED_AT", nullable = false)
    private LocalDateTime noticeCreated;
}
