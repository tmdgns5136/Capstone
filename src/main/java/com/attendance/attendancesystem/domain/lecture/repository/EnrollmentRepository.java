package com.attendance.attendancesystem.domain.lecture.repository;

import com.attendance.attendancesystem.domain.lecture.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    int countByLecture_Id(Long lectureId);
}