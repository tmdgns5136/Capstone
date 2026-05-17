package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.DeviceCommandAck;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceCommandAckRepository extends JpaRepository<DeviceCommandAck, Long> {
    boolean existsByCommandIdAndDeviceId(String commandId, String deviceId);
}