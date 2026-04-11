package com.example.demo.domain.attendance.repository;

import com.example.demo.domain.attendance.entity.AttendanceRecord;
import com.attendance.attendancesystem.domain.student.entity.Student;
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
}