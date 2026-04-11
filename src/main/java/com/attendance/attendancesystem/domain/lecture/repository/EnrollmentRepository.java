package com.attendance.attendancesystem.domain.lecture.repository;

import com.attendance.attendancesystem.domain.lecture.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // [추가] List를 사용하기 위해 필요합니다.

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 기존에 있던 개수 세기 메서드
    int countByLecture_Id(Long lectureId);

    // [추가] 서비스에서 에러가 났던 바로 그 메서드입니다!
    // 특정 강의 ID로 해당 강의를 듣는 수강생 목록 전체를 가져옵니다.
    List<Enrollment> findByLecture_Id(Long lectureId);
}