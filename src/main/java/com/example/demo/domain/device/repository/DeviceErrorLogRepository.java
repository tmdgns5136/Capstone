package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.DeviceErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DeviceErrorLogRepository extends JpaRepository<DeviceErrorLog, Long> {
    List<DeviceErrorLog> findByDeviceOrderByCreatedAtDesc(com.example.demo.domain.device.entity.Device device);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from DeviceErrorLog log where log.device = :device")
    void deleteByDevice(@Param("device") com.example.demo.domain.device.entity.Device device);
}
