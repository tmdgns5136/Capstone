package com.example.demo.domain.professor.service;

import com.example.demo.domain.entity.enumerate.SessionStatus;
import com.example.demo.domain.entity.enumerate.Status;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.home.repository.StudentRepository;
import com.example.demo.domain.lecture.dto.dto.*;
import com.example.demo.domain.lecture.entity.attendance.Objection;
import com.example.demo.domain.lecture.entity.attendance.Official;
import com.example.demo.domain.lecture.entity.lecture.Enrollment;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import com.example.demo.domain.lecture.entity.lecture.LectureSchedule;
import com.example.demo.domain.lecture.entity.lecture.LectureSession;
import com.example.demo.domain.lecture.repository.*;
import com.example.demo.domain.professor.dto.ProfessorDashboardResponse;
import com.example.demo.domain.professor.dto.ProfessorLectureResponse;
import com.example.demo.domain.professor.dto.TodayLectureResponse;
import com.example.demo.domain.attendance.dto.UpdateAttendanceRequest;
import com.example.demo.domain.attendance.entity.AttendanceRecord;
import com.example.demo.domain.attendance.entity.AttendanceStatus;
import com.example.demo.domain.attendance.dto.AttendanceMonitoringResponse;
import com.example.demo.domain.attendance.dto.AttendanceStudentResponse;
import com.example.demo.domain.attendance.repository.AttendanceRecordRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfessorService {

    private final LectureRepository lectureRepository;
    private final LectureScheduleRepository lectureScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureSessionRepository lectureSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final OfficialRepository officialRepository;
    private final ObjectionRepository objectionRepository;


    public List<ProfessorLectureResponse> getLectures(Long professorId) {
        List<Lecture> lectures = lectureRepository.findByProfessor_ProfessorId(professorId);

        if (lectures.isEmpty()) {
            throw new CustomException(404, "담당 강의 정보가 없습니다.");
        }

        List<ProfessorLectureResponse> result = new ArrayList<>();

        for (Lecture lecture : lectures) {
            int studentCount = enrollmentRepository.countByLecture_LectureId(lecture.getLectureId());
            String scheduleText = buildScheduleText(lecture.getLectureId());

            result.add(new ProfessorLectureResponse(
                    lecture.getLectureCode(),
                    lecture.getLectureName(),
                    scheduleText,
                    lecture.getLectureRoom(),
                    studentCount
            ));
        }

        return result;
    }

    public List<TodayLectureResponse> getTodayLectures(Long professorId) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        LocalTime now = LocalTime.now();

        List<LectureSchedule> schedules =
                lectureScheduleRepository.findByLecture_Professor_ProfessorIdAndDayOfWeekOrderByStartTimeAsc(professorId, today);

        if (schedules.isEmpty()) {
            throw new CustomException(404, "오늘 예정된 강의가 없습니다.");
        }

        List<TodayLectureResponse> result = new ArrayList<>();

        for (LectureSchedule schedule : schedules) {
            String status = calculateLectureStatus(now, schedule.getStartTime(), schedule.getEndTime());

            result.add(new TodayLectureResponse(
                    schedule.getLecture().getLectureCode(),
                    schedule.getLecture().getLectureName(),
                    schedule.getLecture().getLectureRoom(),
                    formatTimeRange(schedule.getStartTime(), schedule.getEndTime()),
                    status
            ));
        }

        return result;
    }

    public ProfessorDashboardResponse getDashboard(Long professorId) {
        List<Lecture> lectures = lectureRepository.findByProfessor_ProfessorId(professorId);

        int totalStudents = 0;
        for (Lecture lecture : lectures) {
            totalStudents += enrollmentRepository.countByLecture_LectureId(lecture.getLectureId());
        }

        int todayClasses = lectureScheduleRepository
                .findByLecture_Professor_ProfessorIdAndDayOfWeekOrderByStartTimeAsc(professorId, LocalDate.now().getDayOfWeek())
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
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_ProfessorId(lectureCode, professorId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<LectureSchedule> schedules = lectureScheduleRepository.findByLecture_LectureId(lecture.getLectureId());
        boolean isRegularClassTime = isWithinAnySchedule(now, today.getDayOfWeek(), schedules);

        if (!isRegularClassTime) {
            throw new CustomException(400, "정규 수업 시간이 아닙니다. 계속 하시겠습니까?");
        }

        LectureSession session = lectureSessionRepository.findByLectureAndScheduledAt(lecture, today)
                .orElseGet(() -> {
                    LectureSession newSession = LectureSession.builder().lecture(lecture).scheduledAt(today).build();
                            //LectureSession.create(lecture, today);
                    return lectureSessionRepository.save(newSession);
                });

        if (session.getStatus() == SessionStatus.IN_PROGRESS) {
            throw new CustomException(400, "이미 시작된 강의입니다.");
        }

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new CustomException(400, "이미 종료된 강의는 다시 시작할 수 없습니다.");
        }

        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setSessionStart(LocalDateTime.now());
        lectureSessionRepository.save(session);

        return ActionResponse.success(200,
                "출석 체크가 시작되었습니다.",
                "/api/professors/lectures/" + lectureCode + "/attendance"
        );
    }

    public ActionResponse endLecture(Long professorId, String lectureCode) {
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_ProfessorId(lectureCode, professorId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LectureSession session = lectureSessionRepository.findByLectureAndScheduledAt(lecture, LocalDate.now())
                .orElseThrow(() -> new CustomException(400, "시작되지 않은 강의는 종료할 수 없습니다."));

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new CustomException(400, "이미 종료된 강의입니다.");
        }

        if (session.getStatus() == SessionStatus.NOT_STARTED) {
            throw new CustomException(400, "시작되지 않은 강의는 종료할 수 없습니다.");
        }

        session.setStatus(SessionStatus.ENDED);
        session.setSessionEnd(LocalDateTime.now());
        lectureSessionRepository.save(session);

        return ActionResponse.success(200,
                "출석 체크가 종료되었습니다.",
                "/api/professors/lectures/" + lectureCode + "/attendance"
        );
    }

    private String buildScheduleText(Long lectureId) {
        List<LectureSchedule> schedules = lectureScheduleRepository.findByLecture_LectureId(lectureId);

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
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_ProfessorId(request.getLectureId(), professorId)
                .orElseThrow(() -> new CustomException(404, "출결을 수정할 학생 또는 강의 정보를 찾을 수 없습니다."));

        Student student = studentRepository.findByStudentNum(request.getStudentId());
        if(student == null){
            throw new CustomException(404, "출결을 수정할 학생 또는 강의 정보를 찾을 수 없습니다.");
        }


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

        return ActionResponse.success(200,
                "출결 상태가 변경되었습니다.",
                "/api/professors/lectures/" + request.getLectureId() + "/attendance?semester=2026-1"
        );
    }

    public AttendanceMonitoringResponse getAttendanceMonitoring(Long professorId, String lectureCode, String semester) {
        Lecture lecture = lectureRepository.findByLectureCodeAndProfessor_ProfessorId(lectureCode, professorId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(lecture.getLectureId());
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
                    student.getStudentNum(),
                    student.getStudentName(),
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

    public OfficialListResponse getAbsences(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Official> officialPage = officialRepository.findAll(pageable);

        if (officialPage.isEmpty()) {
            throw new CustomException(404, "공결 신청 내역이 없습니다.");
        }

        List<OfficialItemResponse> items = new ArrayList<>();

        for (Official official : officialPage.getContent()) {
            items.add( OfficialItemResponse.builder()
                    .officialId(official.getOfficialId())
                    .studentId(official.getStudent().getStudentNum())
                    .studentName(official.getStudent().getStudentName())
                    .course(official.getLecture().getLectureName())
                    .sessionId(official.getLectureSession() != null ? official.getLectureSession().getSessionId() : null)
                    .reason(official.getOfficialReason())
                    .date(official.getOfficialCreated().toLocalDate().toString())
                    .status(official.getStatus().getCode())
                    .fileName(official.getFileName()).build());

        }

        return OfficialListResponse.builder()
                .data(items).totalElements(officialPage.getTotalElements())
                .totalPages(officialPage.getTotalPages()).build();

    }

    public ActionResponse processAbsence(Long officialId, ProcessOfficialRequest request) {
        Official official = officialRepository.findById(officialId)
                .orElseThrow(() -> new CustomException(404, "공결 신청 정보를 찾을 수 없습니다."));

        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new CustomException(400, "유효하지 않은 공결 신청 상태입니다.");
        }

        if (newStatus == Status.REJECTED) {
            if (request.getRejectReason() == null || request.getRejectReason().trim().isEmpty()) {
                throw new CustomException(400, "학생에게 안내될 반려 사유를 반드시 입력해주세요.");
            }
        }

        official.setStatus(newStatus);
        official.setOfficialReason(request.getRejectReason());
        officialRepository.save(official);

        return ActionResponse.success(200,
                "공결 신청이 처리되었습니다.",
                "/api/professors/absences"
        );
    }

    public ObjectionListResponse getAppeals(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Objection> objectionPage = objectionRepository.findAll(pageable);

        if (objectionPage.isEmpty()) {
            throw new CustomException(404, "이의 신청 내역이 없습니다.");
        }

        List<ObjectionItemResponse> items = new ArrayList<>();

        for (Objection objection : objectionPage.getContent()) {
            items.add(ObjectionItemResponse.builder()
                    .objectionId(objection.getObjectionId())
                    .studentId(objection.getStudent().getStudentNum())
                    .studentName(objection.getStudent().getStudentName())
                    .course(objection.getLecture().getLectureName())
                    .sessionId(objection.getLectureSession().getSessionId())
                    .reason(objection.getObjectionReason())
                    .date(objection.getObjectionCreated().toLocalDate().toString())
                    .status(objection.getStatus().getCode()).build());
        }

        return ObjectionListResponse.builder()
                .data(items).totalElements(objectionPage.getTotalElements())
                .totalPages(objectionPage.getTotalPages()).build();
    }

    public ActionResponse processAppeal(Long objectionId, ProcessObjectionRequest request) {
        Objection objection = objectionRepository.findById(objectionId)
                .orElseThrow(() -> new CustomException(404, "이의 신청 정보를 찾을 수 없습니다."));

        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new CustomException(400, "유효하지 않은 이의 신청 상태입니다.");
        }

        if (newStatus == Status.REJECTED) {
            if (request.getRejectReason() == null || request.getRejectReason().trim().isEmpty()) {
                throw new CustomException(400, "반려 사유를 입력해주세요.");
            }
        }

        objection.setStatus(newStatus);
        objection.setRejectedReason(request.getRejectReason());
        objectionRepository.save(objection);

        return ActionResponse.success(200,
                "이의 신청이 처리되었습니다.",
                "/api/professors/appeals"
        );
    }

    public Resource downloadAbsenceDocument(Long officialId) {
        Official official = officialRepository.findById(officialId)
                .orElseThrow(() -> new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다."));


        Resource resource = new ClassPathResource(official.getEvidencePath());

        if (!resource.exists()) {
            throw new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다.");
        }

        return resource;
    }

    private String formatTimeRange(LocalTime startTime, LocalTime endTime) {
        return startTime.toString() + "-" + endTime.toString();
    }
}