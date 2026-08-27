package com.example.demo.domain.device.repository;

import com.example.demo.domain.device.entity.DeviceCommandAck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeviceCommandAckRepository extends JpaRepository<DeviceCommandAck, Long> {
    boolean existsByCommandIdAndDeviceId(String commandId, String deviceId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from DeviceCommandAck ack where ack.deviceId = :deviceId")
    void deleteByDeviceId(@Param("deviceId") String deviceId);
}
