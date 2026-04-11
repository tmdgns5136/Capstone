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
import com.attendance.attendancesystem.domain.attendance.dto.UpdateAttendanceRequest;
import com.attendance.attendancesystem.domain.attendance.entity.AttendanceRecord;
import com.attendance.attendancesystem.domain.attendance.entity.AttendanceStatus;
import com.attendance.attendancesystem.domain.attendance.dto.AttendanceMonitoringResponse;
import com.attendance.attendancesystem.domain.attendance.dto.AttendanceStudentResponse;
import com.attendance.attendancesystem.domain.lecture.entity.Enrollment;
import com.attendance.attendancesystem.domain.attendance.repository.AttendanceRecordRepository;
import com.attendance.attendancesystem.domain.student.entity.Student;
import com.attendance.attendancesystem.domain.student.repository.StudentRepository;
import com.attendance.attendancesystem.domain.absence.dto.AbsenceItemResponse;
import com.attendance.attendancesystem.domain.absence.dto.AbsenceListResponse;
import com.attendance.attendancesystem.domain.absence.entity.AbsenceRequest;
import com.attendance.attendancesystem.domain.absence.repository.AbsenceRequestRepository;
import com.attendance.attendancesystem.domain.absence.dto.ProcessAbsenceRequest;
import com.attendance.attendancesystem.domain.absence.entity.AbsenceRequestStatus;
import com.attendance.attendancesystem.domain.appeal.dto.AppealItemResponse;
import com.attendance.attendancesystem.domain.appeal.dto.AppealListResponse;
import com.attendance.attendancesystem.domain.appeal.entity.Appeal;
import com.attendance.attendancesystem.domain.appeal.repository.AppealRepository;
import com.attendance.attendancesystem.domain.appeal.dto.ProcessAppealRequest;
import com.attendance.attendancesystem.domain.appeal.entity.AppealStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

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
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final AbsenceRequestRepository absenceRequestRepository;
    private final AppealRepository appealRepository;

    public ProfessorService(
            LectureRepository lectureRepository,
            LectureScheduleRepository lectureScheduleRepository,
            EnrollmentRepository enrollmentRepository,
            LectureSessionRepository lectureSessionRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            StudentRepository studentRepository,
            AbsenceRequestRepository absenceRequestRepository,
            AppealRepository appealRepository
    ) {
        this.lectureRepository = lectureRepository;
        this.lectureScheduleRepository = lectureScheduleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lectureSessionRepository = lectureSessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.studentRepository = studentRepository;
        this.absenceRequestRepository = absenceRequestRepository;
        this.appealRepository = appealRepository;
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
                lectureScheduleRepository.findByLecture_Professor_IdAndDayOfWeekOrderByStartTimeAsc(professorId, today);

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
                .findByLecture_Professor_IdAndDayOfWeekOrderByStartTimeAsc(professorId, LocalDate.now().getDayOfWeek())
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

    public ActionResponse updateAttendance(Long professorId, UpdateAttendanceRequest request) {
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_Id(request.getLectureId(), professorId)
                .orElseThrow(() -> new CustomException(404, "출결을 수정할 학생 또는 강의 정보를 찾을 수 없습니다."));

        Student student = studentRepository.findByStudentNumber(request.getStudentId())
                .orElseThrow(() -> new CustomException(404, "출결을 수정할 학생 또는 강의 정보를 찾을 수 없습니다."));

        AttendanceStatus newStatus;
        try {
            newStatus = AttendanceStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new CustomException(400, "유효하지 않은 출결 상태입니다.");
        }

        String semester = "2026-1";
        LocalDate attendanceDate = LocalDate.now();

        AttendanceRecord record = attendanceRecordRepository
                .findByStudentAndLectureAndAttendanceDateAndSemester(student, lecture, attendanceDate, semester)
                .orElseGet(() -> new AttendanceRecord(
                        attendanceDate,
                        semester,
                        AttendanceStatus.ABSENT,
                        student,
                        lecture
                ));

        if (record.getStatus() == newStatus) {
            throw new CustomException(400, "이미 해당 출결 상태로 처리되어 있습니다.");
        }

        record.updateStatus(newStatus);
        attendanceRecordRepository.save(record);

        return ActionResponse.success(
                "출결 상태가 변경되었습니다.",
                "/api/professors/lectures/" + request.getLectureId() + "/attendance?semester=2026-1"
        );
    }

    public AttendanceMonitoringResponse getAttendanceMonitoring(Long professorId, String lectureCode, String semester) {
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_Id(lectureCode, professorId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        List<Enrollment> enrollments = enrollmentRepository.findByLecture_Id(lecture.getId());
        List<AttendanceRecord> records = attendanceRecordRepository.findByLectureAndSemester(lecture, semester);

        int totalAttendance = 0;
        int totalLate = 0;
        int totalAbsent = 0;

        for (AttendanceRecord record : records) {
            if (record.getStatus() == AttendanceStatus.PRESENT || record.getStatus() == AttendanceStatus.EXCUSED) {
                totalAttendance++;
            } else if (record.getStatus() == AttendanceStatus.LATE) {
                totalLate++;
            } else if (record.getStatus() == AttendanceStatus.ABSENT) {
                totalAbsent++;
            }
        }

        List<AttendanceStudentResponse> studentResponses = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();

            List<AttendanceRecord> studentRecords =
                    attendanceRecordRepository.findByStudentAndLectureAndSemester(student, lecture, semester);

            int present = 0;
            int late = 0;
            int absent = 0;

            for (AttendanceRecord record : studentRecords) {
                if (record.getStatus() == AttendanceStatus.PRESENT || record.getStatus() == AttendanceStatus.EXCUSED) {
                    present++;
                } else if (record.getStatus() == AttendanceStatus.LATE) {
                    late++;
                } else if (record.getStatus() == AttendanceStatus.ABSENT) {
                    absent++;
                }
            }

            int total = present + late + absent;
            double rate = total == 0 ? 0.0 : Math.round((present * 1000.0 / total)) / 10.0;

            studentResponses.add(new AttendanceStudentResponse(
                    student.getStudentNumber(),
                    student.getName(),
                    present,
                    late,
                    absent,
                    total,
                    rate
            ));
        }

        return new AttendanceMonitoringResponse(
                totalAttendance,
                totalLate,
                totalAbsent,
                studentResponses
        );
    }

    public AbsenceListResponse getAbsences(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<AbsenceRequest> absencePage = absenceRequestRepository.findAll(pageable);

        if (absencePage.isEmpty()) {
            throw new CustomException(404, "공결 신청 내역이 없습니다.");
        }

        List<AbsenceItemResponse> items = new ArrayList<>();

        for (AbsenceRequest absenceRequest : absencePage.getContent()) {
            items.add(new AbsenceItemResponse(
                    absenceRequest.getId(),
                    absenceRequest.getStudent().getStudentNumber(),
                    absenceRequest.getStudent().getName(),
                    absenceRequest.getLecture().getName(),
                    absenceRequest.getAbsenceDate().toString(),
                    absenceRequest.getReason(),
                    absenceRequest.getRequestDate().toString(),
                    absenceRequest.getStatus().name(),
                    absenceRequest.isHasDocument(),
                    absenceRequest.getFileName()
            ));
        }

        return new AbsenceListResponse(
                items,
                absencePage.getTotalElements(),
                absencePage.getTotalPages()
        );
    }

    public ActionResponse processAbsence(Long absenceId, ProcessAbsenceRequest request) {
        AbsenceRequest absenceRequest = absenceRequestRepository.findById(absenceId)
                .orElseThrow(() -> new CustomException(404, "공결 신청 정보를 찾을 수 없습니다."));

        AbsenceRequestStatus newStatus;
        try {
            newStatus = AbsenceRequestStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new CustomException(400, "유효하지 않은 공결 신청 상태입니다.");
        }

        if (newStatus == AbsenceRequestStatus.REJECTED) {
            if (request.getRejectReason() == null || request.getRejectReason().trim().isEmpty()) {
                throw new CustomException(400, "학생에게 안내될 반려 사유를 반드시 입력해주세요.");
            }
        }

        absenceRequest.updateStatus(newStatus, request.getRejectReason());
        absenceRequestRepository.save(absenceRequest);

        return ActionResponse.success(
                "공결 신청이 처리되었습니다.",
                "/api/professors/absences"
        );
    }

    public AppealListResponse getAppeals(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Appeal> appealPage = appealRepository.findAll(pageable);

        if (appealPage.isEmpty()) {
            throw new CustomException(404, "이의 신청 내역이 없습니다.");
        }

        List<AppealItemResponse> items = new ArrayList<>();

        for (Appeal appeal : appealPage.getContent()) {
            items.add(new AppealItemResponse(
                    appeal.getId(),
                    appeal.getStudent().getStudentNumber(),
                    appeal.getStudent().getName(),
                    appeal.getLecture().getName(),
                    appeal.getAppealDate().toString(),
                    appeal.getReason(),
                    appeal.getRequestDate().toString(),
                    appeal.getStatus().name()
            ));
        }

        return new AppealListResponse(
                items,
                appealPage.getTotalElements(),
                appealPage.getTotalPages()
        );
    }

    public ActionResponse processAppeal(Long appealId, ProcessAppealRequest request) {
        Appeal appeal = appealRepository.findById(appealId)
                .orElseThrow(() -> new CustomException(404, "이의 신청 정보를 찾을 수 없습니다."));

        AppealStatus newStatus;
        try {
            newStatus = AppealStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new CustomException(400, "유효하지 않은 이의 신청 상태입니다.");
        }

        if (newStatus == AppealStatus.REJECTED) {
            if (request.getRejectReason() == null || request.getRejectReason().trim().isEmpty()) {
                throw new CustomException(400, "반려 사유를 입력해주세요.");
            }
        }

        appeal.updateStatus(newStatus, request.getRejectReason());
        appealRepository.save(appeal);

        return ActionResponse.success(
                "이의 신청이 처리되었습니다.",
                "/api/professors/appeals"
        );
    }

    public Resource downloadAbsenceDocument(Long absenceId) {
        AbsenceRequest absenceRequest = absenceRequestRepository.findById(absenceId)
                .orElseThrow(() -> new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다."));

        if (!absenceRequest.isHasDocument() ||
                absenceRequest.getFilePath() == null ||
                absenceRequest.getFilePath().trim().isEmpty()) {
            throw new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다.");
        }

        Resource resource = new ClassPathResource(absenceRequest.getFilePath());

        if (!resource.exists()) {
            throw new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다.");
        }

        return resource;
    }

    private String formatTimeRange(LocalTime startTime, LocalTime endTime) {
        return startTime.toString() + "-" + endTime.toString();
    }
}