package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.lecture.entity.attendance.Official;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfficialRepository extends JpaRepository<Official, Long> {

}
