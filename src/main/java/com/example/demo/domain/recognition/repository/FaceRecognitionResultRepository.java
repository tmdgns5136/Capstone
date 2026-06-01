package com.example.demo.domain.recognition.repository;

import com.example.demo.domain.device.entity.DeviceCapture;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.recognition.entity.FaceRecognitionResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaceRecognitionResultRepository extends JpaRepository<FaceRecognitionResult, Long> {
    boolean existsByCaptureAndStudent(DeviceCapture capture, Student student);
    List<FaceRecognitionResult> findByCapture(DeviceCapture capture);
}
