package com.example.demo.domain.professor.service;

import com.example.demo.domain.enumerate.SessionStatus;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.lecture.attendance.dto.*;
import com.example.demo.domain.student.lecture.attendance.entity.Objection;
import com.example.demo.domain.student.lecture.attendance.entity.Official;
import com.example.demo.domain.student.lecture.attendance.repository.ObjectionRepository;
import com.example.demo.domain.student.lecture.attendance.repository.OfficialRepository;
import com.example.demo.domain.student.lecture.entity.Enrollment;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.entity.LectureSchedule;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import com.example.demo.domain.professor.dto.ProfessorDashboardResponse;
import com.example.demo.domain.professor.dto.ProfessorLectureResponse;
import com.example.demo.domain.professor.dto.TodayLectureResponse;
import com.example.demo.domain.attendance.dto.UpdateAttendanceRequest;
import com.example.demo.domain.attendance.entity.AttendanceRecord;
import com.example.demo.domain.attendance.entity.AttendanceStatus;
import com.example.demo.domain.attendance.dto.AttendanceMonitoringResponse;
import com.example.demo.domain.attendance.dto.AttendanceStudentResponse;
import com.example.demo.domain.attendance.repository.AttendanceRecordRepository;
import com.example.demo.domain.student.lecture.repository.EnrollmentRepository;
import com.example.demo.domain.student.lecture.repository.LectureRepository;
import com.example.demo.domain.student.lecture.repository.LectureScheduleRepository;
import com.example.demo.domain.student.lecture.repository.LectureSessionRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.domain.student.lecture.board.repository.NoticeBoardRepository;
import com.example.demo.domain.student.lecture.board.repository.QuestionBoardRepository;
import com.example.demo.domain.student.lecture.board.entity.NoticeBoard;
import com.example.demo.domain.student.lecture.board.entity.QuestionBoard;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfessorService {

    private final LectureRepository lectureRepository;
    private final LectureScheduleRepository lectureScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureSessionRepository lectureSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final OfficialRepository officialRepository;
    private final ObjectionRepository objectionRepository;
    private final NoticeBoardRepository noticeBoardRepository;
    private final QuestionBoardRepository questionBoardRepository;


    public List<ProfessorLectureResponse> getLectures(Long professorId, String semester) {
        List<Lecture> lectures = lectureRepository.findByProfessor_ProfessorId(professorId);

        if (lectures.isEmpty()) {
            throw new CustomException(404, "담당 강의 정보가 없습니다.");
        }

        // "2026학년도 1학기" → year=2026L, sem="1" 파싱
        Long filterYear = null;
        String filterSem = null;
        if (semester != null && !semester.isEmpty()) {
            try {
                filterYear = Long.parseLong(semester.replaceAll(".*?(\\d{4})학년도.*", "$1"));
                filterSem = semester.replaceAll(".*?(\\d)학기.*", "$1");
            } catch (Exception ignored) {}
        }

        final Long fYear = filterYear;
        final String fSem = filterSem;

        List<ProfessorLectureResponse> result = new ArrayList<>();
        for (Lecture lecture : lectures) {
            if (fYear != null && !lecture.getLectureYear().equals(fYear)) continue;
            if (fSem != null && !lecture.getLectureSemester().equals(fSem)) continue;

            int studentCount = enrollmentRepository.countByLecture_LectureId(lecture.getLectureId());
            String scheduleText = buildScheduleText(lecture.getLectureId());
            result.add(new ProfessorLectureResponse(
                    lecture.getLectureId(),
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
            Long studentCount = (long) enrollmentRepository.countByLecture_LectureId(schedule.getLecture().getLectureId());

            result.add(new TodayLectureResponse(
                    schedule.getLecture().getLectureId(),
                    schedule.getLecture().getLectureCode(),
                    schedule.getLecture().getLectureName(),
                    schedule.getLecture().getLectureRoom(),
                    formatTimeRange(schedule.getStartTime(), schedule.getEndTime()),
                    status,
                    studentCount

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

        List<AttendanceStatus> presentStatuses = List.of(AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED);
        int totalRecords = attendanceRecordRepository.countByLecture_Professor_ProfessorId(professorId);
        int presentRecords = attendanceRecordRepository.countByLecture_Professor_ProfessorIdAndStatusIn(professorId, presentStatuses);
        double avgAttendance = totalRecords == 0 ? 0.0 : Math.round((presentRecords * 100.0 / totalRecords) * 10.0) / 10.0;

        int pendingAbsences = officialRepository.countByLecture_Professor_ProfessorIdAndStatus(
                professorId,
                Status.PENDING
        );

        return new ProfessorDashboardResponse(
                totalStudents,
                avgAttendance,
                pendingAbsences,
                todayClasses
        );
    }

    @Transactional
    public ActionResponse createNotice(Long lectureId, String title, String content) {
        if (title == null || title.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            throw new CustomException(400, "제목 또는 내용을 입력해주세요.");
        }

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        NoticeBoard notice = NoticeBoard.builder()
                .noticeTitle(title)
                .noticeContext(content)
                .lecture(lecture)
                .professor(lecture.getProfessor())
                .build();

        noticeBoardRepository.save(notice);

        return ActionResponse.success(
                201,
                "공지사항이 등록되었습니다.",
                "/api/professors/lectures/" + lectureId + "/notices"
        );
    }

    public Map<String, Object> getNotices(Long lectureId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<NoticeBoard> noticePage = noticeBoardRepository.findByLecture_LectureId(lectureId, pageable);

        if (noticePage.isEmpty()) {
            throw new CustomException(404, "등록된 공지사항이 없습니다.");
        }

        List<Map<String, Object>> data = new ArrayList<>();

        for (NoticeBoard notice : noticePage.getContent()) {
            Map<String, Object> item = new HashMap<>();
            item.put("noticeId", notice.getNoticeId());
            item.put("title", notice.getNoticeTitle());
            item.put("content", notice.getNoticeContext());
            item.put("createdDate", notice.getNoticeCreated() != null
                    ? notice.getNoticeCreated().toLocalDate().toString()
                    : null);
            item.put("views", 0);
            item.put("comments", 0);
            data.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("success", true);
        response.put("data", data);
        response.put("totalElements", noticePage.getTotalElements());
        response.put("totalPages", noticePage.getTotalPages());

        return response;
    }

    @Transactional
    public ActionResponse updateNotice(Long noticeId, String title, String content) {
        // 1. 수정할 공지사항을 DB에서 찾습니다.
        NoticeBoard notice = noticeBoardRepository.findById(noticeId)
                .orElseThrow(() -> new CustomException(404, "수정할 공지사항을 찾을 수 없습니다."));

        // 2. 제목과 내용 수정
        notice.setNoticeTitle(title);
        notice.setNoticeContext(content);

        // ⭐ 3. 날짜를 현재 시간으로 갱신 (수정하면 날짜가 바뀜)
        notice.setNoticeCreated(LocalDateTime.now());

        return ActionResponse.success(200, "공지사항이 수정되었습니다.", null);
    }

    public Map<String, Object> getQuestions(Long lectureId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<QuestionBoard> questionPage = questionBoardRepository.findByLecture_LectureId(lectureId, pageable);

        // [수정] 질문이 없다고 에러를 던지면 500이나 404가 나서 화면이 죽습니다.
        // 그냥 빈 리스트를 보내는 게 정석입니다.
        List<Map<String, Object>> data = new ArrayList<>();

        if (!questionPage.isEmpty()) {
            for (QuestionBoard question : questionPage.getContent()) {
                Map<String, Object> item = new HashMap<>();
                item.put("questionId", question.getQuestionId());
                item.put("studentNum", question.getStudent() != null ? question.getStudent().getStudentNum() : "익명");
                item.put("title", question.getQuestionTitle());
                item.put("isPrivate", question.getQuestionPrivate());
                item.put("isAnswered", question.getQuestionAnswer() != null && !question.getQuestionAnswer().trim().isEmpty());
                item.put("createdDate", question.getQuestionCreated() != null
                        ? question.getQuestionCreated().toLocalDate().toString()
                        : "");
                data.add(item);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data); // 빈 리스트라도 그대로 보냄
        response.put("totalElements", questionPage.getTotalElements());
        response.put("totalPages", questionPage.getTotalPages());

        return response;
    }

    public Map<String, Object> getQuestionDetail(Long lectureId, Long questionId) {
        QuestionBoard question = questionBoardRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(404, "해당 질문을 찾을 수 없습니다."));

        if (question.getLecture() == null || !question.getLecture().getLectureId().equals(lectureId)) {
            throw new CustomException(404, "해당 질문을 찾을 수 없습니다.");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("questionId", question.getQuestionId());
        data.put("title", question.getQuestionTitle());
        data.put("content", question.getQuestionContext());
        data.put("isPrivate", question.getQuestionPrivate());
        data.put("createdDate", question.getQuestionCreated() != null
                ? question.getQuestionCreated().toLocalDate().toString()
                : null);
        data.put("views", 0);

        if (question.getQuestionAnswer() != null && !question.getQuestionAnswer().trim().isEmpty()) {
            Map<String, Object> answer = new HashMap<>();
            answer.put("content", question.getQuestionAnswer());
            answer.put("professorName",
                    question.getProfessor() != null ? question.getProfessor().getProfessorName() : null);
            answer.put("answeredDate", null);
            data.put("answer", answer);
        } else {
            data.put("answer", null);
        }

        return data;
    }

    @Transactional
    public ActionResponse createAnswer(Long questionId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new CustomException(400, "답변 내용을 입력해주세요.");
        }

        QuestionBoard question = questionBoardRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(404, "답변할 질문 정보를 찾을 수 없습니다."));

        question.setQuestionAnswer(content);
        questionBoardRepository.save(question);

        Long lectureId = question.getLecture().getLectureId();

        return ActionResponse.success(
                201,
                "답변이 등록되었습니다.",
                "/api/professors/lectures/" + lectureId + "/questions"
        );
    }

    @Transactional
    public ActionResponse updateAnswer(Long questionId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new CustomException(400, "답변 내용을 입력해주세요.");
        }

        QuestionBoard question = questionBoardRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(404, "수정할 답변 정보를 찾을 수 없습니다."));

        question.setQuestionAnswer(content);
        questionBoardRepository.save(question);

        Long lectureId = question.getLecture().getLectureId();

        return ActionResponse.success(
                200,
                "답변이 수정되었습니다.",
                "/api/professors/lectures/" + lectureId + "/questions"
        );
    }

    @Transactional
    public ActionResponse deleteAnswer(Long questionId) {
        QuestionBoard question = questionBoardRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(404, "삭제할 답변 정보를 찾을 수 없습니다."));

        question.setQuestionAnswer(null);
        questionBoardRepository.save(question);

        Long lectureId = question.getLecture().getLectureId();

        return ActionResponse.success(
                200,
                "답변이 삭제되었습니다.",
                "/api/professors/lectures/" + lectureId + "/questions"
        );
    }

    @Transactional
    public ActionResponse startLecture(Long professorId, String lectureIdStr) {
        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureIdStr))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<LectureSchedule> schedules = lectureScheduleRepository.findByLecture_LectureId(lecture.getLectureId());
        if (!isWithinAnySchedule(now, today.getDayOfWeek(), schedules)) {
            throw new CustomException(400, "정규 수업 시간이 아닙니다. 계속 하시겠습니까?");
        }

        // ✅ orElseGet에서 IN_PROGRESS로 만들지 않고, 기존 세션 유무만 확인
        LectureSession session = lectureSessionRepository.findByLectureAndScheduledAt(lecture, today)
                .orElse(null);

        if (session != null) {
            // 기존 세션이 있을 때만 상태 체크
            if (session.getStatus() == SessionStatus.IN_PROGRESS) {
                throw new CustomException(400, "이미 시작된 강의입니다.");
            }
//            if (session.getStatus() == SessionStatus.ENDED) {
//                throw new CustomException(400, "이미 종료된 강의는 다시 시작할 수 없습니다.");
//            }
            session.setStatus(SessionStatus.IN_PROGRESS);
            session.setSessionStart(LocalDateTime.now());
            lectureSessionRepository.save(session);
        } else {
            // ✅ 세션이 없을 때만 새로 생성
            LectureSession newSession = LectureSession.builder()
                    .lecture(lecture)
                    .scheduledAt(today)
                    .sessionNum(1L)
                    .status(SessionStatus.IN_PROGRESS)
                    .sessionStart(LocalDateTime.now())
                    .build();
            lectureSessionRepository.save(newSession);
        }

        return ActionResponse.success(200,
                "출석 체크가 시작되었습니다.",
                "/api/professors/lectures/" + lectureIdStr + "/attendance"
        );
    }

    @Transactional
    public ActionResponse endLecture(Long professorId, String lectureIdStr) {
        // [수정] findByLectureCode 대신 findById를 사용합니다.
        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureIdStr))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LectureSession session = lectureSessionRepository.findByLectureAndScheduledAt(lecture, LocalDate.now())
                .orElseThrow(() -> new CustomException(400, "시작되지 않은 강의는 종료할 수 없습니다."));

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new CustomException(400, "이미 종료된 강의입니다.");
        }

        session.setStatus(SessionStatus.ENDED);
        session.setSessionEnd(LocalDateTime.now());
        lectureSessionRepository.save(session);

        return ActionResponse.success(200,
                "출석 체크가 종료되었습니다.",
                "/api/professors/lectures/" + lectureIdStr + "/attendance"
        );
    }

    @Transactional
    public ActionResponse updateAttendance(Long professorId, UpdateAttendanceRequest request) {
        // [수정] findByLectureCode 대신 findById를 사용합니다.
        Lecture lecture = lectureRepository.findById(Long.valueOf(request.getLectureId()))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        Student student = studentRepository.findByStudentNum(request.getStudentId());
        if(student == null){
            throw new CustomException(404, "출결을 수정할 학생 정보를 찾을 수 없습니다.");
        }

        AttendanceStatus newStatus = AttendanceStatus.valueOf(request.getStatus());
        String semester = "2026-1";
        LocalDate attendanceDate = LocalDate.parse(request.getDate());

        AttendanceRecord record = attendanceRecordRepository
                .findByStudentAndLectureAndAttendanceDateAndSemester(student, lecture, attendanceDate, semester)
                .orElseGet(() -> new AttendanceRecord(attendanceDate, semester, AttendanceStatus.TBD, student, lecture));

        record.updateStatus(newStatus);
        attendanceRecordRepository.save(record);

        return ActionResponse.success(200, "출결 상태가 변경되었습니다.", null);
    }

    public AttendanceMonitoringResponse getAttendanceMonitoring(Long professorId, String lectureIdStr, String semester, String dateStr) {
        // [범인 검거] findByLectureCode 대신 findById를 사용하도록 수정!
        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureIdStr))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(lecture.getLectureId());
        LocalDate targetDate = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr) : null;

        List<AttendanceStudentResponse> studentResponses = new ArrayList<>();
        int totalAttendance = 0, totalLate = 0, totalAbsent = 0;

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();

            List<AttendanceRecord> studentRecords = attendanceRecordRepository.findByStudentAndLectureAndSemester(student, lecture, semester);
            int presentCount = 0, lateCount = 0, absentCount = 0;

            for (AttendanceRecord record : studentRecords) {
                if (record.getStatus() == AttendanceStatus.PRESENT || record.getStatus() == AttendanceStatus.EXCUSED) presentCount++;
                else if (record.getStatus() == AttendanceStatus.LATE) lateCount++;
                else if (record.getStatus() == AttendanceStatus.ABSENT) absentCount++;
            }

            AttendanceStatus currentStatus = AttendanceStatus.TBD;
            if (targetDate != null) {
                currentStatus = attendanceRecordRepository
                        .findByStudentAndLectureAndAttendanceDateAndSemester(student, lecture, targetDate, semester)
                        .map(AttendanceRecord::getStatus)
                        .orElse(AttendanceStatus.TBD);
            }

            if (currentStatus == AttendanceStatus.PRESENT || currentStatus == AttendanceStatus.EXCUSED) totalAttendance++;
            else if (currentStatus == AttendanceStatus.LATE) totalLate++;
            else if (currentStatus == AttendanceStatus.ABSENT) totalAbsent++;

            int totalSessions = presentCount + lateCount + absentCount;
            double rate = totalSessions == 0 ? 0.0 : Math.round((presentCount * 1000.0 / totalSessions)) / 10.0;

            studentResponses.add(new AttendanceStudentResponse(
                    student.getStudentNum(),
                    student.getStudentName(),
                    currentStatus,
                    presentCount,
                    lateCount,
                    absentCount,
                    totalSessions,
                    rate
            ));
        }

        return new AttendanceMonitoringResponse(totalAttendance, totalLate, totalAbsent, studentResponses);
    }

    public OfficialListResponse getAbsences(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Official> officialPage = officialRepository.findAll(pageable);

        if (officialPage.isEmpty()) {
            return OfficialListResponse.builder()
                    .data(new ArrayList<>())
                    .totalElements(0L)
                    .totalPages(0)
                    .build();
        }

        List<OfficialItemResponse> items = new ArrayList<>();

        for (Official official : officialPage.getContent()) {
            items.add(OfficialItemResponse.builder()
                    .officialId(official.getOfficialId())
                    .studentId(official.getStudent() != null ? official.getStudent().getStudentNum() : "00000000")
                    .studentName(official.getStudent() != null ? official.getStudent().getStudentName() : "이름없음")
                    .course(official.getLecture() != null ? official.getLecture().getLectureName() : "강의명없음")
                    .sessionId(official.getLectureSession() != null ? official.getLectureSession().getSessionId() : null)
                    .reason(official.getOfficialReason())
                    .date(official.getOfficialCreated() != null
                            ? official.getOfficialCreated().toLocalDate().toString()
                            : "")
                    .status(official.getStatus() != null ? official.getStatus().name() : "PENDING")
                    .fileName(official.getFileName())
                    .build());
        }

        return OfficialListResponse.builder()
                .data(items)
                .totalElements(officialPage.getTotalElements())
                .totalPages(officialPage.getTotalPages())
                .build();
    }

    @Transactional
    public ActionResponse processAbsence(Long officialId, ProcessOfficialRequest request) {
        Official official = officialRepository.findById(officialId)
                .orElseThrow(() -> new CustomException(404, "공결 신청 정보를 찾을 수 없습니다."));

        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            throw new CustomException(400, "공결 처리 상태값은 필수입니다.");
        }

        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus());
        } catch (Exception e) {
            throw new CustomException(400, "유효하지 않은 공결 신청 상태입니다.");
        }

        if (newStatus == Status.REJECTED) {
            if (request.getRejectReason() == null || request.getRejectReason().trim().isEmpty()) {
                throw new CustomException(400, "학생에게 안내될 반려 사유를 반드시 입력해주세요.");
            }
            official.setRejectedReason(request.getRejectReason());
        }

        official.setStatus(newStatus);
        return ActionResponse.success(200, "공결 신청이 처리되었습니다.", "/api/professors/absences");
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

    @Transactional
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

        return ActionResponse.success(200, "이의 신청이 처리되었습니다.", "/api/professors/appeals");
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

    private String buildScheduleText(Long lectureId) {
        List<LectureSchedule> schedules = lectureScheduleRepository.findByLecture_LectureId(lectureId);
        if (schedules.isEmpty()) return "";
        List<String> parts = new ArrayList<>();
        for (LectureSchedule schedule : schedules) {
            parts.add(convertDayToKorean(schedule.getDayOfWeek()) + " " + formatTimeRange(schedule.getStartTime(), schedule.getEndTime()));
        }
        return String.join(", ", parts);
    }

    private String calculateLectureStatus(LocalTime now, LocalTime startTime, LocalTime endTime) {
        if (now.isBefore(startTime)) return "UPCOMING";
        if (now.isAfter(endTime)) return "COMPLETED";
        return "IN_PROGRESS";
    }

    private boolean isWithinAnySchedule(LocalTime now, DayOfWeek today, List<LectureSchedule> schedules) {
        for (LectureSchedule schedule : schedules) {
            if (schedule.getDayOfWeek() == today) {
                if (!now.isBefore(schedule.getStartTime()) && !now.isAfter(schedule.getEndTime())) return true;
            }
        }
        return false;
    }

    private String convertDayToKorean(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "월"; case TUESDAY -> "화"; case WEDNESDAY -> "수"; case THURSDAY -> "목"; case FRIDAY -> "금"; case SATURDAY -> "토"; case SUNDAY -> "일";
        };
    }

    private String formatTimeRange(LocalTime startTime, LocalTime endTime) {
        return startTime.toString() + "-" + endTime.toString();
    }

    public byte[] exportAttendance(Long lectureId, Long professorId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(lectureId);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("출결 통계");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("학번");
            header.createCell(1).setCellValue("이름");
            header.createCell(2).setCellValue("출석");
            header.createCell(3).setCellValue("지각");
            header.createCell(4).setCellValue("결석");
            header.createCell(5).setCellValue("총 출결 수");
            header.createCell(6).setCellValue("출석률");

            int rowIndex = 1;

            for (Enrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();

                List<AttendanceRecord> records =
                        attendanceRecordRepository.findByStudentAndLectureAndSemester(
                                student,
                                lecture,
                                lecture.getLectureYear() + "-" + lecture.getLectureSemester()
                        );

                long presentCount = records.stream()
                        .filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.EXCUSED)
                        .count();

                long lateCount = records.stream()
                        .filter(r -> r.getStatus() == AttendanceStatus.LATE)
                        .count();

                long absentCount = records.stream()
                        .filter(r -> r.getStatus() == AttendanceStatus.ABSENT)
                        .count();

                long totalCount = presentCount + lateCount + absentCount;

                double attendanceRate = totalCount == 0
                        ? 0.0
                        : Math.round((presentCount * 1000.0 / totalCount)) / 10.0;

                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(student.getStudentNum());
                row.createCell(1).setCellValue(student.getStudentName());
                row.createCell(2).setCellValue(presentCount);
                row.createCell(3).setCellValue(lateCount);
                row.createCell(4).setCellValue(absentCount);
                row.createCell(5).setCellValue(totalCount);
                row.createCell(6).setCellValue(attendanceRate + "%");
            }

            for (int i = 0; i <= 6; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new CustomException(500, "데이터가 많아 파일 생성에 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.");
        }
    }
}