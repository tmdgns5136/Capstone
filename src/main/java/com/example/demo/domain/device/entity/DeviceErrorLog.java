package com.example.demo.domain.device.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DEVICE_ERROR_LOG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOG_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEVICE_ID_PK", nullable = false)
    private Device device;

    @Column(name = "ERROR_CODE", nullable = false, length = 100)
    private String errorCode;

    @Column(name = "MESSAGE", nullable = false, length = 1000)
    private String message;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}
