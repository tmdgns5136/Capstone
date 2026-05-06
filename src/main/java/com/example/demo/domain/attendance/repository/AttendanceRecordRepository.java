package com.example.demo.domain.attendance.repository;

import com.example.demo.domain.attendance.entity.AttendanceRecord;
import com.example.demo.domain.attendance.entity.AttendanceStatus;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByStudentAndLectureAndAttendanceDateAndSemester(
            Student student,
            Lecture lecture,
            LocalDate attendanceDate,
            String semester
    );

    List<AttendanceRecord> findByLectureAndSemester(Lecture lecture, String semester);

    List<AttendanceRecord> findByStudentAndLectureAndSemester(Student student, Lecture lecture, String semester);

    int countByLecture_Professor_ProfessorId(Long professorId);
    int countByLecture_Professor_ProfessorIdAndStatusIn(Long professorId, List<AttendanceStatus> statuses);
}