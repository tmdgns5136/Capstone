package com.example.demo.domain.student.home.repository;

import com.example.demo.domain.enumerate.ImagePosition;
import com.example.demo.domain.enumerate.ImageType;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.home.entity.etc.Image;
import com.example.demo.domain.student.home.entity.user.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    public Optional<Image> findByFilePath(String filePath);
    Optional<Image> findByStudentAndPositionAndImageType(Student student, ImagePosition position, ImageType type);
    Optional<Image> findByStudentAndPosition(Student student, ImagePosition position);
    public List<Image> findByStudent(Student student);
    public List<Image> findByStudentAndStatus(Student student, Status status);
    public boolean existsByStudentAndImageCreatedAfter(Student student, LocalDateTime imageCreated);

    // [대기 중인 요청 조회용] Type이 REQUESTED, Status가 PENDING이면서 CENTER 사진만 가져옴
    Page<Image> findByImageTypeAndStatusAndPosition(ImageType type, Status status, ImagePosition position, Pageable pageable);

    // [처리 완료된 요청 조회용] Type이 REQUESTED, Status가 PENDING이 '아니면서' CENTER 사진만 가져옴
    Page<Image> findByImageTypeNotAndStatusNotAndPosition(ImageType type, Status status, ImagePosition position, Pageable pageable);

    // 특정 요청 ID(묶음)로 사진 3장을 다 가져오는 메서드
    List<Image> findByRequestId(String requestId);

    List<Image> findByStudentAndImageType(Student student, ImageType imageType);

    Page<Image> findByStatusNotAndPosition(Status status, ImagePosition position, Pageable pageable);
}
