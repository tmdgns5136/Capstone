package com.example.demo.domain.student.lecture.repository;

import com.example.demo.domain.enumerate.SessionStatus;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LectureSessionRepository extends JpaRepository<LectureSession, Long> {

    Optional<LectureSession> findByLectureAndScheduledAt(
            Lecture lecture,
            LocalDate scheduledAt
    );

    List<LectureSession> findByLecture(Lecture lecture);

    List<LectureSession> findByLectureAndScheduledAtOrderBySessionStartAsc(
            Lecture lecture,
            LocalDate scheduledAt
    );

    @Query("""
        select s
        from LectureSession s
        where s.lecture.lectureRoom = :classroom
          and s.status = :status
          and s.sessionStart <= :targetTime
          and (s.sessionEnd is null or s.sessionEnd >= :targetTime)
        order by s.sessionStart desc
        """)
    List<LectureSession> findCurrentSessionsByClassroomAndTime(
            @Param("classroom") String classroom,
            @Param("targetTime") LocalDateTime targetTime,
            @Param("status") SessionStatus status
    );

    default Optional<LectureSession> findCurrentSessionByClassroomAndTime(
            String classroom,
            LocalDateTime targetTime
    ) {
        return findCurrentSessionsByClassroomAndTime(classroom, targetTime, SessionStatus.IN_PROGRESS)
                .stream()
                .findFirst();
    }
}
