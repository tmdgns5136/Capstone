package com.example.demo.repository.user;

import com.example.demo.entity.enumerate.ImagePosition;
import com.example.demo.entity.user.Image;
import com.example.demo.entity.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    public Optional<Image> findByFilePath(String filePath);
    Optional<Image> findByStudentAndPosition(Student student, ImagePosition position);
}
