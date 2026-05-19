package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.entity.DeviceCapture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceCaptureRepository extends JpaRepository<DeviceCapture, Long> {
    Optional<DeviceCapture> findByCaptureIdAndDevice(Long captureId, Device device);

    boolean existsByDeviceAndUploadRequestId(Device device, String uploadRequestId);
}
