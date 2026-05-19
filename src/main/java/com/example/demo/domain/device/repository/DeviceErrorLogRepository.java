package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.DeviceErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceErrorLogRepository extends JpaRepository<DeviceErrorLog, Long> {
    List<DeviceErrorLog> findByDeviceOrderByCreatedAtDesc(com.example.demo.domain.device.entity.Device device);
}
