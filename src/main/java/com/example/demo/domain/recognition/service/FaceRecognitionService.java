package com.example.demo.domain.recognition.service;

import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.model.CompareFacesMatch;
import com.amazonaws.services.rekognition.model.CompareFacesRequest;
import com.amazonaws.services.rekognition.model.CompareFacesResult;
import com.amazonaws.services.rekognition.model.Image;
import com.amazonaws.util.IOUtils;
import com.example.demo.domain.device.entity.DeviceCapture;
import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.repository.DeviceCaptureRepository;
import com.example.demo.domain.device.repository.DeviceRepository;
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
import com.example.demo.domain.enumerate.StudentClassStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.FileInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaceRecognitionService {

    private static final int REKOGNITION_MAX_IMAGE_BYTES = 4_500_000;
    private static final int MIN_RESIZE_WIDTH = 800;

    private final AmazonRekognition amazonRekognition;
    private final DeviceCaptureRepository deviceCaptureRepository;
    private final DeviceRepository deviceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ImageRepository imageRepository;
    private final AttendanceRepository attendanceRepository;
    private final FaceRecognitionResultRepository faceRecognitionResultRepository;

    @Value("${aws.rekognition.similarity-threshold:50}")
    private Float similarityThreshold;

    @Value("${attendance.away.confirmation-rounds:1}")
    private int awayConfirmationRounds;

    @Async
    @Transactional
    public void recognizeAsync(Long captureId) {
        DeviceCapture capture = deviceCaptureRepository.findById(captureId)
                .orElseThrow(() -> new IllegalArgumentException("captureId를 찾을 수 없습니다: " + captureId));
        recognize(capture);
    }

    @Async
    @Transactional
    public void evaluateAwayAsync(Long captureId) {
        DeviceCapture capture = deviceCaptureRepository.findById(captureId)
                .orElseThrow(() -> new IllegalArgumentException("captureId를 찾을 수 없습니다: " + captureId));
        List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(
                capture.getLectureSession().getLecture().getLectureId()
        );
        markAwayForUnrecognized(capture, enrollments);
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

            for (Enrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                Float bestSimilarity = findBestSimilarity(student, targetImage);

                if (bestSimilarity != null) {
                    recognizedCount++;
                    saveRecognitionResult(capture, student, bestSimilarity);
                    markAttendance(capture, student);

                    log.info("얼굴인식 성공: captureId={}, studentNum={}, similarity={}",
                            capture.getCaptureId(), student.getStudentNum(), bestSimilarity);
                }
            }

            int total = enrollments.size();
            capture.setRecognizedCount(recognizedCount);
            capture.setUnrecognizedCount(Math.max(total - recognizedCount, 0));
            capture.setProcessingStatus(DeviceProcessingStatus.DONE);
            capture.setProcessedAt(LocalDateTime.now());

            // The current capture must be DONE before it can be included in
            // the all-camera AWAY confirmation window.
            markAwayForUnrecognized(capture, enrollments);
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
        attendance.setStudentClassStatus(StudentClassStatus.SIT);
        attendance.setCheckTime(now);
        attendance.setExitTime(null);

        // 최초 인식 시 입장 시간 기록
        if (attendance.getEnterTime() == null) {
            attendance.setEnterTime(now);
        }

        attendanceRepository.save(attendance);
    }

    private void markAwayForUnrecognized(DeviceCapture capture, List<Enrollment> enrollments) {
        int confirmationRounds = Math.max(1, awayConfirmationRounds);
        String classroom = capture.getLectureSession().getLecture().getLectureRoom();
        if (classroom == null || classroom.isBlank()) {
            return;
        }

        List<Device> activeDevices = deviceRepository
                .findByClassroomIgnoreCaseAndActiveTrueOrderByDeviceIdAsc(classroom.trim());
        if (activeDevices.isEmpty()) {
            return;
        }

        List<FaceRecognitionResult> sessionResults = faceRecognitionResultRepository
                .findByCapture_LectureSession(capture.getLectureSession());
        Map<Long, LocalDateTime> lastRecognizedAtByStudent = new HashMap<>();
        for (FaceRecognitionResult result : sessionResults) {
            lastRecognizedAtByStudent.merge(
                    result.getStudent().getStudentId(),
                    result.getRecognizedAt(),
                    (previous, current) -> current.isAfter(previous) ? current : previous
            );
        }

        List<DeviceCapture> candidateCaptures = new java.util.ArrayList<>();
        Map<Long, List<DeviceCapture>> capturesByDevice = new HashMap<>();
        for (Device device : activeDevices) {
            List<DeviceCapture> completedCaptures = deviceCaptureRepository
                    .findByLectureSessionAndDeviceOrderByCapturedAtDesc(capture.getLectureSession(), device)
                    .stream()
                    .filter(deviceCapture -> deviceCapture.getProcessingStatus() == DeviceProcessingStatus.DONE)
                    .limit(confirmationRounds)
                    .toList();

            if (completedCaptures.size() < confirmationRounds) {
                return;
            }

            candidateCaptures.addAll(completedCaptures);
            capturesByDevice.put(device.getId(), completedCaptures);
        }

        Map<Long, java.util.Set<Long>> recognizedStudentsByCapture = new HashMap<>();
        for (FaceRecognitionResult result : faceRecognitionResultRepository.findByCaptureIn(candidateCaptures)) {
            recognizedStudentsByCapture
                    .computeIfAbsent(result.getCapture().getCaptureId(), ignored -> new java.util.HashSet<>())
                    .add(result.getStudent().getStudentId());
        }

        LocalDateTime now = LocalDateTime.now();
        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            Attendance attendance = attendanceRepository
                    .findByLectureSessionAndStudent(capture.getLectureSession(), student)
                    .orElse(null);
            LocalDateTime lastRecognizedAt = lastRecognizedAtByStudent.get(student.getStudentId());

            if (attendance == null || attendance.getAttendStatus() != AttendStatus.ATTEND
                    || attendance.getStudentClassStatus() == StudentClassStatus.AWAY
                    || lastRecognizedAt == null) {
                continue;
            }

            boolean awayAcrossAllDevices = capturesByDevice.values().stream()
                    .flatMap(List::stream)
                    .allMatch(deviceCapture -> {
                        if (!deviceCapture.getCapturedAt().isAfter(lastRecognizedAt)) {
                            return false;
                        }
                        return !recognizedStudentsByCapture
                                .getOrDefault(deviceCapture.getCaptureId(), java.util.Set.of())
                                .contains(student.getStudentId());
                    });

            if (awayAcrossAllDevices) {
                attendance.setStudentClassStatus(StudentClassStatus.AWAY);
                attendance.setExitTime(now);
                attendanceRepository.save(attendance);
                log.info("자리비움 처리: captureId={}, studentNum={}, devices={}, rounds={}",
                        capture.getCaptureId(), student.getStudentNum(), activeDevices.size(), confirmationRounds);
            }
        }
    }

    private Image toRekognitionImage(Path path) throws Exception {
        byte[] imageBytes;
        try (InputStream inputStream = new FileInputStream(path.toFile())) {
            imageBytes = IOUtils.toByteArray(inputStream);
        }

        if (imageBytes.length > REKOGNITION_MAX_IMAGE_BYTES) {
            imageBytes = resizeForRekognition(path, imageBytes.length);
        }

        return new Image().withBytes(ByteBuffer.wrap(imageBytes));
    }

    private byte[] resizeForRekognition(Path path, int originalBytes) throws Exception {
        BufferedImage source = ImageIO.read(path.toFile());
        if (source == null) {
            throw new IllegalStateException("Rekognition image resize failed. Unsupported image file: " + path);
        }

        BufferedImage current = toRgbImage(source);
        for (float quality : new float[]{0.9f, 0.8f, 0.7f}) {
            byte[] compressed = writeJpeg(current, quality);
            if (compressed.length <= REKOGNITION_MAX_IMAGE_BYTES) {
                log.info("Rekognition image compressed: path={}, originalBytes={}, resizedBytes={}",
                        path, originalBytes, compressed.length);
                return compressed;
            }
        }

        int width = current.getWidth();
        int height = current.getHeight();
        while (width > MIN_RESIZE_WIDTH) {
            width = Math.max(MIN_RESIZE_WIDTH, Math.round(width * 0.75f));
            height = Math.max(1, Math.round(height * 0.75f));
            current = resize(current, width, height);

            for (float quality : new float[]{0.8f, 0.65f, 0.5f}) {
                byte[] compressed = writeJpeg(current, quality);
                if (compressed.length <= REKOGNITION_MAX_IMAGE_BYTES) {
                    log.info("Rekognition image resized: path={}, originalBytes={}, resizedBytes={}, width={}, height={}",
                            path, originalBytes, compressed.length, width, height);
                    return compressed;
                }
            }
        }

        throw new IllegalStateException("Rekognition image is still larger than 4.5MB after resizing: " + path);
    }

    private BufferedImage toRgbImage(BufferedImage source) {
        BufferedImage rgb = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = rgb.createGraphics();
        graphics.drawImage(source, 0, 0, null);
        graphics.dispose();
        return rgb;
    }

    private BufferedImage resize(BufferedImage source, int width, int height) {
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resized.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
        graphics.drawImage(source, 0, 0, width, height, null);
        graphics.dispose();
        return resized;
    }

    private byte[] writeJpeg(BufferedImage image, float quality) throws Exception {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
            try (ImageOutputStream imageOutput = ImageIO.createImageOutputStream(output)) {
                writer.setOutput(imageOutput);
                ImageWriteParam params = writer.getDefaultWriteParam();
                params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                params.setCompressionQuality(quality);
                writer.write(null, new IIOImage(image, null, null), params);
            } finally {
                writer.dispose();
            }
            return output.toByteArray();
        }
    }
}
