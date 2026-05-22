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

    Optional<Image> findByFilePath(String filePath);

    Optional<Image> findByStudentAndPositionAndImageType(
            Student student,
            ImagePosition position,
            ImageType type
    );

    Optional<Image> findByStudentAndPosition(Student student, ImagePosition position);

    List<Image> findByStudent(Student student);

    List<Image> findByStudentAndStatus(Student student, Status status);

    boolean existsByStudentAndImageCreatedAfter(Student student, LocalDateTime imageCreated);

    Page<Image> findByImageTypeAndStatusAndPosition(
            ImageType type,
            Status status,
            ImagePosition position,
            Pageable pageable
    );

    Page<Image> findByImageTypeNotAndStatusNotAndPosition(
            ImageType type,
            Status status,
            ImagePosition position,
            Pageable pageable
    );

    List<Image> findByRequestId(String requestId);

    List<Image> findByStudentAndImageType(Student student, ImageType imageType);

    Page<Image> findByStatusNotAndPosition(
            Status status,
            ImagePosition position,
            Pageable pageable
    );
}