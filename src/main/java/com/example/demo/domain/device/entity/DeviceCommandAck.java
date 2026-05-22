package com.example.demo.domain.device.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "device_command_ack",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_device_command_ack_command_device",
                        columnNames = {"commandId", "deviceId"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceCommandAck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String commandId;

    private String commandType;

    private Long lectureId;

    private String deviceId;

    private String result;

    @Column(length = 500)
    private String message;

    private LocalDateTime processedAt;
}