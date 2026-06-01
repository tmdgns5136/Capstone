package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    boolean existsByDeviceId(String deviceId);
    Optional<Device> findByDeviceId(String deviceId);
    Optional<Device> findFirstByClassroomAndActiveTrue(String classroom);
}