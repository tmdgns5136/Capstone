package com.example.demo.domain.student.home.repository;

import com.example.demo.domain.enumerate.ImagePosition;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.home.entity.etc.Image;
import com.example.demo.domain.student.home.entity.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    public Optional<Image> findByFilePath(String filePath);
    public Optional<Image> findByStudentAndPosition(Student student, ImagePosition position);
    public List<Image> findByStudent(Student student);
    public List<Image> findByStudentAndStatus(Student student, Status status);
    public boolean existsByStudentAndImageCreatedAfter(Student student, LocalDateTime imageCreated);
}
