package com.attendance.attendancesystem.domain.professor.service;

import com.attendance.attendancesystem.domain.lecture.entity.Lecture;
import com.attendance.attendancesystem.domain.lecture.entity.LectureSchedule;
import com.attendance.attendancesystem.domain.lecture.entity.LectureSession;
import com.attendance.attendancesystem.domain.lecture.entity.LectureSessionStatus;
import com.attendance.attendancesystem.domain.lecture.repository.EnrollmentRepository;
import com.attendance.attendancesystem.domain.lecture.repository.LectureRepository;
import com.attendance.attendancesystem.domain.lecture.repository.LectureScheduleRepository;
import com.attendance.attendancesystem.domain.lecture.repository.LectureSessionRepository;
import com.attendance.attendancesystem.domain.professor.dto.ProfessorDashboardResponse;
import com.attendance.attendancesystem.domain.professor.dto.ProfessorLectureResponse;
import com.attendance.attendancesystem.domain.professor.dto.TodayLectureResponse;
import com.attendance.attendancesystem.global.exception.CustomException;
import com.attendance.attendancesystem.global.response.ActionResponse;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProfessorService {

    private final LectureRepository lectureRepository;
    private final LectureScheduleRepository lectureScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureSessionRepository lectureSessionRepository;

    public ProfessorService(
            LectureRepository lectureRepository,
            LectureScheduleRepository lectureScheduleRepository,
            EnrollmentRepository enrollmentRepository,
            LectureSessionRepository lectureSessionRepository
    ) {
        this.lectureRepository = lectureRepository;
        this.lectureScheduleRepository = lectureScheduleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lectureSessionRepository = lectureSessionRepository;
    }

    public List<ProfessorLectureResponse> getLectures(Long professorId) {
        List<Lecture> lectures = lectureRepository.findByProfessor_Id(professorId);

        if (lectures.isEmpty()) {
            throw new CustomException(404, "담당 강의 정보가 없습니다.");
        }

        List<ProfessorLectureResponse> result = new ArrayList<>();

        for (Lecture lecture : lectures) {
            int studentCount = enrollmentRepository.countByLecture_Id(lecture.getId());
            String scheduleText = buildScheduleText(lecture.getId());

            result.add(new ProfessorLectureResponse(
                    lecture.getLectureCode(),
                    lecture.getName(),
                    scheduleText,
                    lecture.getRoom(),
                    studentCount
            ));
        }

        return result;
    }

    public List<TodayLectureResponse> getTodayLectures(Long professorId) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        LocalTime now = LocalTime.now();

        List<LectureSchedule> schedules =
                lectureScheduleRepository.findByLectureProfessor_IdAndDayOfWeekOrderByStartTimeAsc(professorId, today);

        if (schedules.isEmpty()) {
            throw new CustomException(404, "오늘 예정된 강의가 없습니다.");
        }

        List<TodayLectureResponse> result = new ArrayList<>();

        for (LectureSchedule schedule : schedules) {
            String status = calculateLectureStatus(now, schedule.getStartTime(), schedule.getEndTime());

            result.add(new TodayLectureResponse(
                    schedule.getLecture().getLectureCode(),
                    schedule.getLecture().getName(),
                    schedule.getLecture().getRoom(),
                    formatTimeRange(schedule.getStartTime(), schedule.getEndTime()),
                    status
            ));
        }

        return result;
    }

    public ProfessorDashboardResponse getDashboard(Long professorId) {
        List<Lecture> lectures = lectureRepository.findByProfessor_Id(professorId);

        int totalStudents = 0;
        for (Lecture lecture : lectures) {
            totalStudents += enrollmentRepository.countByLecture_Id(lecture.getId());
        }

        int todayClasses = lectureScheduleRepository
                .findByLectureProfessor_IdAndDayOfWeekOrderByStartTimeAsc(professorId, LocalDate.now().getDayOfWeek())
                .size();

        // 아직 Attendance / AbsenceRequest 테이블이 없으므로 임시값
        double avgAttendance = 0.0;
        int pendingAbsences = 0;

        return new ProfessorDashboardResponse(
                totalStudents,
                avgAttendance,
                pendingAbsences,
                todayClasses
        );
    }

    public ActionResponse startLecture(Long professorId, String lectureCode) {
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_Id(lectureCode, professorId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<LectureSchedule> schedules = lectureScheduleRepository.findByLecture_Id(lecture.getId());
        boolean isRegularClassTime = isWithinAnySchedule(now, today.getDayOfWeek(), schedules);

        if (!isRegularClassTime) {
            throw new CustomException(400, "정규 수업 시간이 아닙니다. 계속 하시겠습니까?");
        }

        LectureSession session = lectureSessionRepository.findByLectureAndSessionDate(lecture, today)
                .orElseGet(() -> {
                    LectureSession newSession = LectureSession.create(lecture, today);
                    return lectureSessionRepository.save(newSession);
                });

        if (session.getStatus() == LectureSessionStatus.IN_PROGRESS) {
            throw new CustomException(400, "이미 시작된 강의입니다.");
        }

        if (session.getStatus() == LectureSessionStatus.ENDED) {
            throw new CustomException(400, "이미 종료된 강의는 다시 시작할 수 없습니다.");
        }

        session.start();
        lectureSessionRepository.save(session);

        return ActionResponse.success(
                "출석 체크가 시작되었습니다.",
                "/api/professors/lectures/" + lectureCode + "/attendance"
        );
    }

    public ActionResponse endLecture(Long professorId, String lectureCode) {
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_Id(lectureCode, professorId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LectureSession session = lectureSessionRepository.findByLectureAndSessionDate(lecture, LocalDate.now())
                .orElseThrow(() -> new CustomException(400, "시작되지 않은 강의는 종료할 수 없습니다."));

        if (session.getStatus() == LectureSessionStatus.ENDED) {
            throw new CustomException(400, "이미 종료된 강의입니다.");
        }

        if (session.getStatus() == LectureSessionStatus.NOT_STARTED) {
            throw new CustomException(400, "시작되지 않은 강의는 종료할 수 없습니다.");
        }

        session.end();
        lectureSessionRepository.save(session);

        return ActionResponse.success(
                "출석 체크가 종료되었습니다.",
                "/api/professors/lectures/" + lectureCode + "/attendance"
        );
    }

    private String buildScheduleText(Long lectureId) {
        List<LectureSchedule> schedules = lectureScheduleRepository.findByLecture_Id(lectureId);

        if (schedules.isEmpty()) {
            return "";
        }

        List<String> parts = new ArrayList<>();

        for (LectureSchedule schedule : schedules) {
            parts.add(convertDayToKorean(schedule.getDayOfWeek()) + " " +
                    formatTimeRange(schedule.getStartTime(), schedule.getEndTime()));
        }

        return String.join(", ", parts);
    }

    private String calculateLectureStatus(LocalTime now, LocalTime startTime, LocalTime endTime) {
        if (now.isBefore(startTime)) {
            return "UPCOMING";
        }
        if (now.isAfter(endTime)) {
            return "COMPLETED";
        }
        return "IN_PROGRESS";
    }

    private boolean isWithinAnySchedule(LocalTime now, DayOfWeek today, List<LectureSchedule> schedules) {
        for (LectureSchedule schedule : schedules) {
            if (schedule.getDayOfWeek() == today) {
                boolean started = !now.isBefore(schedule.getStartTime());
                boolean notEnded = !now.isAfter(schedule.getEndTime());

                if (started && notEnded) {
                    return true;
                }
            }
        }
        return false;
    }

    private String convertDayToKorean(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "월";
            case TUESDAY -> "화";
            case WEDNESDAY -> "수";
            case THURSDAY -> "목";
            case FRIDAY -> "금";
            case SATURDAY -> "토";
            case SUNDAY -> "일";
        };
    }

    private String formatTimeRange(LocalTime startTime, LocalTime endTime) {
        return startTime.toString() + "-" + endTime.toString();
    }
}