package com.example.demo.repository;

import com.example.demo.entity.user.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {
}
