package com.example.demo.domain.stream.repository;

import com.example.demo.domain.stream.entity.StreamEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface StreamEventRepository extends JpaRepository<StreamEvent, Long> {

    @Query("""
        select count(se) > 0
        from StreamEvent se
        where se.deviceId = :deviceId
          and se.lectureSession.sessionId = :sessionId
          and se.recognitionProcessed = false
          and se.eventTime <= :capturedAt
        """)
    boolean existsPendingEvent(
            @Param("deviceId") String deviceId,
            @Param("sessionId") Long sessionId,
            @Param("capturedAt") LocalDateTime capturedAt
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update StreamEvent se
        set se.recognitionProcessed = true,
            se.processedAt = :processedAt
        where se.deviceId = :deviceId
          and se.lectureSession.sessionId = :sessionId
          and se.recognitionProcessed = false
          and se.eventTime <= :capturedAt
        """)
    int markProcessedBeforeCapture(
            @Param("deviceId") String deviceId,
            @Param("sessionId") Long sessionId,
            @Param("capturedAt") LocalDateTime capturedAt,
            @Param("processedAt") LocalDateTime processedAt
    );
}