package com.example.demo.domain.stream.repository;

import com.example.demo.domain.stream.entity.StreamDetection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StreamDetectionRepository extends JpaRepository<StreamDetection, Long> {
}