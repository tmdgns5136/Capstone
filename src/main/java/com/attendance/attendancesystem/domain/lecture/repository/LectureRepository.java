package com.attendance.attendancesystem.domain.lecture.repository;

import com.attendance.attendancesystem.domain.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findByProfessor_Id(Long professorId);

    Optional<Lecture> findByLectureCodeAndProfessor_Id(String lectureCode, Long professorId);
}