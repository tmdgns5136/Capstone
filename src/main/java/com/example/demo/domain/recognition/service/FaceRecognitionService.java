package com.example.demo.domain.recognition.service;

import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.model.CompareFacesMatch;
import com.amazonaws.services.rekognition.model.CompareFacesRequest;
import com.amazonaws.services.rekognition.model.CompareFacesResult;
import com.amazonaws.services.rekognition.model.Image;
import com.amazonaws.util.IOUtils;
import com.example.demo.domain.device.entity.DeviceCapture;
import com.example.demo.domain.device.repository.DeviceCaptureRepository;
import com.example.demo.domain.device.enumerate.DeviceProcessingStatus;
import com.example.demo.domain.enumerate.AttendStatus;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.enumerate.ImagePosition;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.ImageRepository;
import com.example.demo.domain.student.lecture.attendance.entity.Attendance;
import com.example.demo.domain.student.lecture.entity.Enrollment;
import com.example.demo.domain.student.lecture.attendance.repository.AttendanceRepository;
import com.example.demo.domain.student.lecture.repository.EnrollmentRepository;
import com.example.demo.domain.recognition.entity.FaceRecognitionResult;
import com.example.demo.domain.recognition.repository.FaceRecognitionResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaceRecognitionService {

    private final AmazonRekognition amazonRekognition;
    private final DeviceCaptureRepository deviceCaptureRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ImageRepository imageRepository;
    private final AttendanceRepository attendanceRepository;
    private final FaceRecognitionResultRepository faceRecognitionResultRepository;

    @Value("${aws.rekognition.similarity-threshold:50}")
    private Float similarityThreshold;

    @Async
    @Transactional
    public void recognizeAsync(Long captureId) {
        DeviceCapture capture = deviceCaptureRepository.findById(captureId)
                .orElseThrow(() -> new IllegalArgumentException("captureId를 찾을 수 없습니다: " + captureId));
        recognize(capture);
    }

    @Transactional
    public void recognize(DeviceCapture capture) {
        capture.setProcessingStatus(DeviceProcessingStatus.PROCESSING);

        try {
            Path targetPath = Path.of(capture.getStoredFilePath());
            if (!Files.exists(targetPath)) {
                throw new IllegalStateException("업로드 이미지 파일을 찾을 수 없습니다: " + targetPath);
            }

            Image targetImage = toRekognitionImage(targetPath);
            List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(
                    capture.getLectureSession().getLecture().getLectureId()
            );

            int recognizedCount = 0;
            Set<Long> recognizedStudentIds = new HashSet<>();

            for (Enrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                Float bestSimilarity = findBestSimilarity(student, targetImage);

                if (bestSimilarity != null) {
                    recognizedCount++;
                    recognizedStudentIds.add(student.getStudentId());

                    saveRecognitionResult(capture, student, bestSimilarity);
                    markAttendance(capture, student);

                    log.info("얼굴인식 성공: captureId={}, studentNum={}, similarity={}",
                            capture.getCaptureId(), student.getStudentNum(), bestSimilarity);
                }
            }

// 이전에 출석 상태였는데 이번 사진에서 인식되지 않은 학생은 자리비움 처리
            markAwayForUnrecognized(capture, enrollments, recognizedStudentIds);

            int total = enrollments.size();
            capture.setRecognizedCount(recognizedCount);
            capture.setUnrecognizedCount(Math.max(total - recognizedCount, 0));
            capture.setProcessingStatus(DeviceProcessingStatus.DONE);
            capture.setProcessedAt(LocalDateTime.now());
        } catch (Exception e) {
            capture.setProcessingStatus(DeviceProcessingStatus.FAILED);
            capture.setProcessedAt(LocalDateTime.now());
            log.error("얼굴인식 실패: captureId={}", capture.getCaptureId(), e);
        }
    }

    private Float findBestSimilarity(Student student, Image targetImage) {
        List<com.example.demo.domain.student.home.entity.etc.Image> referenceImages = imageRepository.findByStudent(student).stream()
                .filter(image -> image.getFilePath() != null)
                .filter(image -> image.getStatus() == Status.APPROVED || image.getStatus() == Status.PENDING)
                .sorted(Comparator.comparing(image -> image.getPosition() == ImagePosition.CENTER ? 0 : 1))
                .toList();

        Float best = null;
        for (com.example.demo.domain.student.home.entity.etc.Image referenceImage : referenceImages) {
            try {
                Path sourcePath = Path.of(referenceImage.getFilePath());
                if (!Files.exists(sourcePath)) {
                    continue;
                }

                CompareFacesRequest request = new CompareFacesRequest()
                        .withSourceImage(toRekognitionImage(sourcePath))
                        .withTargetImage(targetImage)
                        .withSimilarityThreshold(similarityThreshold);

                CompareFacesResult result = amazonRekognition.compareFaces(request);
                for (CompareFacesMatch match : result.getFaceMatches()) {
                    if (best == null || match.getSimilarity() > best) {
                        best = match.getSimilarity();
                    }
                }

                if (best != null) {
                    break;
                }
            } catch (Exception e) {
                log.warn("학생 기준 사진 비교 실패: studentNum={}, imagePath={}",
                        student.getStudentNum(), referenceImage.getFilePath(), e);
            }
        }
        return best;
    }

    private void saveRecognitionResult(DeviceCapture capture, Student student, Float similarity) {
        if (faceRecognitionResultRepository.existsByCaptureAndStudent(capture, student)) {
            return;
        }

        FaceRecognitionResult result = FaceRecognitionResult.builder()
                .capture(capture)
                .student(student)
                .studentNum(student.getStudentNum())
                .similarity(similarity)
                .recognizedAt(LocalDateTime.now())
                .build();

        faceRecognitionResultRepository.save(result);
    }

    private void markAttendance(DeviceCapture capture, Student student) {
        LocalDateTime now = LocalDateTime.now();

        Attendance attendance = attendanceRepository
                .findByLectureSessionAndStudent(capture.getLectureSession(), student)
                .orElseGet(() -> Attendance.builder()
                        .lectureSession(capture.getLectureSession())
                        .student(student)
                        .build());

        attendance.setAttendStatus(AttendStatus.ATTEND);
        attendance.setCheckTime(now);

        // 최초 인식 시 입장 시간 기록
        if (attendance.getEnterTime() == null) {
            attendance.setEnterTime(now);
        }

        attendanceRepository.save(attendance);
    }

    private void markAwayForUnrecognized(
            DeviceCapture capture,
            List<Enrollment> enrollments,
            Set<Long> recognizedStudentIds
    ) {
        LocalDateTime now = LocalDateTime.now();

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();

            if (recognizedStudentIds.contains(student.getStudentId())) {
                continue;
            }

            attendanceRepository
                    .findByLectureSessionAndStudent(capture.getLectureSession(), student)
                    .ifPresent(attendance -> {
                        if (attendance.getAttendStatus() == AttendStatus.ATTEND) {
                            attendance.setAttendStatus(AttendStatus.AWAY);
                            attendance.setExitTime(now);
                            attendanceRepository.save(attendance);

                            log.info("자리비움 처리: captureId={}, studentNum={}",
                                    capture.getCaptureId(), student.getStudentNum());
                        }
                    });
        }
    }

    private Image toRekognitionImage(Path path) throws Exception {
        try (InputStream inputStream = new FileInputStream(path.toFile())) {
            ByteBuffer imageBytes = ByteBuffer.wrap(IOUtils.toByteArray(inputStream));
            return new Image().withBytes(imageBytes);
        }
    }
}
