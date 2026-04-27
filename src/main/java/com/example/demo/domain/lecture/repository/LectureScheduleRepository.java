package com.example.demo.domain.lecture.repository;

import com.example.demo.domain.lecture.entity.lecture.LectureSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface LectureScheduleRepository extends JpaRepository<LectureSchedule, Long> {

    List<LectureSchedule> findByLecture_Professor_ProfessorIdAndDayOfWeekOrderByStartTimeAsc(Long professorId, DayOfWeek dayOfWeek);

    List<LectureSchedule> findByLecture_LectureId(Long lectureId);
}