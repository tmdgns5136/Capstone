package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.entity.DeviceCapture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface DeviceCaptureRepository extends JpaRepository<DeviceCapture, Long> {
    Optional<DeviceCapture> findByCaptureIdAndDevice(Long captureId, Device device);

    boolean existsByDeviceAndUploadRequestId(Device device, String uploadRequestId);

    List<DeviceCapture> findByLectureSessionAndDeviceOrderByCapturedAtDesc(
            com.example.demo.domain.student.lecture.entity.LectureSession lectureSession,
            Device device
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from DeviceCapture dc where dc.device = :device")
    void deleteByDevice(@Param("device") Device device);
}
