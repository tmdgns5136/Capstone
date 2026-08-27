package com.example.demo.domain.stream.repository;

import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.stream.entity.StreamDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StreamDetectionRepository extends JpaRepository<StreamDetection, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from StreamDetection sd where sd.device = :device")
    void deleteByDevice(@Param("device") Device device);
}
