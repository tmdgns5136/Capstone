package com.attendance.attendancesystem.domain.absence.repository;

import com.attendance.attendancesystem.domain.absence.entity.AbsenceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, Long> {
    // 교수 ID를 기준으로 관련 강의의 공결 신청만 페이징하여 가져옵니다.
    Page<AbsenceRequest> findByLecture_Professor_Id(Long professorId, Pageable pageable);
}