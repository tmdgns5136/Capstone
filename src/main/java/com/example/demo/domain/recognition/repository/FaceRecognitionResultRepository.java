package com.example.demo.domain.recognition.repository;

import com.example.demo.domain.device.entity.DeviceCapture;
import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.recognition.entity.FaceRecognitionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FaceRecognitionResultRepository extends JpaRepository<FaceRecognitionResult, Long> {
    boolean existsByCaptureAndStudent(DeviceCapture capture, Student student);
    List<FaceRecognitionResult> findByCapture(DeviceCapture capture);
    List<FaceRecognitionResult> findByCapture_LectureSession(
            com.example.demo.domain.student.lecture.entity.LectureSession lectureSession
    );
    List<FaceRecognitionResult> findByCaptureIn(List<DeviceCapture> captures);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            delete from FaceRecognitionResult result
            where result.capture in (
                select capture from DeviceCapture capture where capture.device = :device
            )
            """)
    void deleteByDevice(@Param("device") Device device);
}
