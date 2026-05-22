package com.example.demo.domain.professor.service;

import com.example.demo.domain.enumerate.AttendStatus;
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
import com.example.demo.domain.student.lecture.board.entity.Answer;
import com.example.demo.domain.student.lecture.board.repository.AnswerRepository;
import com.example.demo.domain.enumerate.NoticeType;
import com.example.demo.domain.student.notification.entity.Notification;
import com.example.demo.domain.student.notification.repository.NotificationRepository;
import com.example.demo.domain.student.lecture.attendance.entity.Attendance;
import com.example.demo.domain.student.lecture.attendance.repository.AttendanceRepository;
import com.example.demo.domain.student.lecture.dto.SessionData;
import com.example.demo.domain.device.entity.Device;
import com.example.demo.domain.device.repository.DeviceRepository;
import com.example.demo.domain.device.service.DeviceService;
import com.example.demo.domain.enumerate.StudentClassStatus;
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
import java.time.Duration;
import java.util.stream.Collectors;
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
    private final AnswerRepository answerRepository;
    private final NotificationRepository notificationRepository;
    private final AttendanceRepository attendanceRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;

    public List<ProfessorLectureResponse> getLectures(Long professorId, String semester) {
        List<Lecture> lectures = lectureRepository.findByProfessor_ProfessorId(professorId);
        if (lectures.isEmpty()) return new ArrayList<>();

        String filterYear = null;
        String filterSem = null;

        if (semester != null && !semester.trim().isEmpty()) {
            String digits = semester.replaceAll("[^0-9]", "");
            if (digits.length() >= 5) {
                filterYear = digits.substring(0, 4);
                filterSem = digits.substring(4, 5);
            } else if (digits.length() > 0) {
                filterSem = digits.substring(digits.length() - 1);
            }
        }

        List<ProfessorLectureResponse> result = new ArrayList<>();
        for (Lecture lecture : lectures) {
            String dbYear = String.valueOf(lecture.getLectureYear()).replaceAll("[^0-9]", "");
            String dbSem = String.valueOf(lecture.getLectureSemester()).replaceAll("[^0-9]", "");

            if (filterYear != null && !dbYear.equals(filterYear)) continue;
            if (filterSem != null && !dbSem.equals(filterSem)) continue;

            int studentCount = enrollmentRepository.countByLecture_LectureId(lecture.getLectureId());
            String scheduleText = buildScheduleText(lecture);
            result.add(new ProfessorLectureResponse(
                    String.valueOf(lecture.getLectureId()),
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
        List<Lecture> lectures = lectureRepository.findByProfessor_ProfessorId(professorId);

        if (lectures.isEmpty()) return new ArrayList<>();

        List<TodayLectureResponse> result = new ArrayList<>();
        for (Lecture lecture : lectures) {
            if (!isLectureDay(lecture.getLectureDay(), today)) continue;

            List<LectureSession> todaySessions = lectureSessionRepository.findByLectureAndScheduledAtOrderBySessionStartAsc(lecture, LocalDate.now());
            String status = todaySessions.stream().anyMatch(s -> s.getStatus() == SessionStatus.IN_PROGRESS) ? "IN_PROGRESS"
                    : todaySessions.stream().anyMatch(s -> s.getStatus() == SessionStatus.ENDED) ? "DONE" : "WAIT";

            Long studentCount = (long) enrollmentRepository.countByLecture_LectureId(lecture.getLectureId());
            result.add(new TodayLectureResponse(
                    String.valueOf(lecture.getLectureId()),
                    lecture.getLectureCode(),
                    lecture.getLectureName(),
                    lecture.getLectureRoom(),
                    lecture.getLectureStart() + "-" + lecture.getLectureEnd(),
                    status,
                    studentCount
            ));
        }
        return result;
    }

    public ProfessorDashboardResponse getDashboard(Long professorId) {
        List<Lecture> lectures = lectureRepository.findByProfessor_ProfessorId(professorId);
        int totalStudents = lectures.stream().mapToInt(l -> enrollmentRepository.countByLecture_LectureId(l.getLectureId())).sum();

        DayOfWeek today = LocalDate.now().getDayOfWeek();
        int todayClasses = (int) lectures.stream().filter(l -> isLectureDay(l.getLectureDay(), today)).count();

        List<AttendanceStatus> presentStatuses = List.of(AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED);
        int totalRecords = attendanceRecordRepository.countByLecture_Professor_ProfessorId(professorId);
        int presentRecords = attendanceRecordRepository.countByLecture_Professor_ProfessorIdAndStatusIn(professorId, presentStatuses);
        double avgAttendance = totalRecords == 0 ? 0.0 : Math.round((presentRecords * 100.0 / totalRecords) * 10.0) / 10.0;

        int pendingAbsences = officialRepository.countByLecture_Professor_ProfessorIdAndStatus(professorId, Status.PENDING);

        return new ProfessorDashboardResponse(totalStudents, avgAttendance, pendingAbsences, todayClasses);
    }

    @Transactional
    public ActionResponse createNotice(Long lectureId, String title, String content) {
        if (title == null || title.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            throw new CustomException(400, "제목 또는 내용을 입력해주세요.");
        }
        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));
        NoticeBoard notice = NoticeBoard.builder().noticeTitle(title).noticeContext(content).lecture(lecture).professor(lecture.getProfessor()).build();
        noticeBoardRepository.save(notice);
        return ActionResponse.success(201, "공지사항이 등록되었습니다.", "/api/professors/lectures/" + lectureId + "/notices");
    }

    public Map<String, Object> getNotices(Long lectureId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<NoticeBoard> noticePage = noticeBoardRepository.findByLecture_LectureId(lectureId, pageable);
        List<Map<String, Object>> data = noticePage.getContent().stream().map(notice -> {
            Map<String, Object> item = new HashMap<>();
            item.put("noticeId", notice.getNoticeId());
            item.put("title", notice.getNoticeTitle());
            item.put("content", notice.getNoticeContext());
            item.put("createdDate", notice.getNoticeCreated() != null ? notice.getNoticeCreated().toLocalDate().toString() : null);
            item.put("views", 0);
            item.put("comments", 0);
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); response.put("success", true); response.put("data", data);
        response.put("totalElements", noticePage.getTotalElements()); response.put("totalPages", noticePage.getTotalPages());
        return response;
    }

    @Transactional
    public ActionResponse updateNotice(Long noticeId, String title, String content) {
        NoticeBoard notice = noticeBoardRepository.findById(noticeId).orElseThrow(() -> new CustomException(404, "수정할 공지사항을 찾을 수 없습니다."));
        notice.setNoticeTitle(title); notice.setNoticeContext(content); notice.setNoticeCreated(LocalDateTime.now());
        return ActionResponse.success(200, "공지사항이 수정되었습니다.", null);
    }

    public Map<String, Object> getQuestions(Long lectureId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<QuestionBoard> questionPage = questionBoardRepository.findByLecture_LectureId(lectureId, pageable);
        List<Map<String, Object>> data = questionPage.getContent().stream().map(question -> {
            Map<String, Object> item = new HashMap<>();
            item.put("questionId", question.getQuestionId());
            item.put("studentNum", question.getStudent() != null ? question.getStudent().getStudentNum() : "익명");
            item.put("title", question.getQuestionTitle());
            item.put("isPrivate", question.getQuestionPrivate());
            item.put("isAnswered", question.getAnswer() != null);
            item.put("createdDate", question.getQuestionCreated() != null ? question.getQuestionCreated().toLocalDate().toString() : "");
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", data); response.put("totalElements", questionPage.getTotalElements()); response.put("totalPages", questionPage.getTotalPages());
        return response;
    }

    public Map<String, Object> getQuestionDetail(Long lectureId, Long questionId) {
        QuestionBoard question = questionBoardRepository.findById(questionId).orElseThrow(() -> new CustomException(404, "해당 질문을 찾을 수 없습니다."));
        if (question.getLecture() == null || !question.getLecture().getLectureId().equals(lectureId)) {
            throw new CustomException(404, "해당 질문을 찾을 수 없습니다.");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("questionId", question.getQuestionId()); data.put("title", question.getQuestionTitle());
        data.put("content", question.getQuestionContext()); data.put("isPrivate", question.getQuestionPrivate());
        data.put("createdDate", question.getQuestionCreated() != null ? question.getQuestionCreated().toLocalDate().toString() : null);
        data.put("views", 0);

        if (question.getAnswer() != null) {
            Answer ans = question.getAnswer();
            Map<String, Object> answer = new HashMap<>();
            answer.put("answerId", ans.getId()); answer.put("content", ans.getContent());
            answer.put("professorName", ans.getProfessor() != null ? ans.getProfessor().getProfessorName() : null);
            answer.put("answeredDate", ans.getAnswerCreated() != null ? ans.getAnswerCreated().toLocalDate().toString() : null);
            data.put("answer", answer);
        } else {
            data.put("answer", null);
        }
        return data;
    }

    @Transactional
    public ActionResponse createAnswer(Long questionId, String content) {
        if (content == null || content.trim().isEmpty()) throw new CustomException(400, "답변 내용을 입력해주세요.");
        QuestionBoard question = questionBoardRepository.findById(questionId).orElseThrow(() -> new CustomException(404, "답변할 질문 정보를 찾을 수 없습니다."));
        if (question.getAnswer() != null) throw new CustomException(409, "이미 답변이 등록된 질문입니다.");

        Answer answer = Answer.builder().content(content).question(question).professor(question.getLecture().getProfessor()).build();
        answerRepository.save(answer);

        Notification notification = Notification.builder()
                .message(question.getLecture().getLectureName() + " 강의 질문에 답변이 등록되었습니다.")
                .relatedId(question.getQuestionId().toString()).isRead(false).noticeType(NoticeType.ANSWER)
                .student(question.getStudent()).lecture(question.getLecture()).build();
        notificationRepository.save(notification);

        return ActionResponse.success(201, "답변이 등록되었습니다.", "/api/professors/lectures/" + question.getLecture().getLectureId() + "/questions");
    }

    @Transactional
    public ActionResponse updateAnswer(Long questionId, String content) {
        if (content == null || content.trim().isEmpty()) throw new CustomException(400, "답변 내용을 입력해주세요.");
        QuestionBoard question = questionBoardRepository.findById(questionId).orElseThrow(() -> new CustomException(404, "수정할 답변 정보를 찾을 수 없습니다."));
        if (question.getAnswer() == null) throw new CustomException(404, "등록된 답변이 없습니다.");
        question.getAnswer().setContent(content);
        return ActionResponse.success(200, "답변이 수정되었습니다.", "/api/professors/lectures/" + question.getLecture().getLectureId() + "/questions");
    }

    @Transactional
    public ActionResponse deleteAnswer(Long questionId) {
        QuestionBoard question = questionBoardRepository.findById(questionId).orElseThrow(() -> new CustomException(404, "삭제할 답변 정보를 찾을 수 없습니다."));
        if (question.getAnswer() == null) throw new CustomException(404, "등록된 답변이 없습니다.");
        answerRepository.delete(question.getAnswer());
        return ActionResponse.success(200, "답변이 삭제되었습니다.", "/api/professors/lectures/" + question.getLecture().getLectureId() + "/questions");
    }

    @Transactional
    public ActionResponse startLecture(Long professorId, String lectureIdStr) {
        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureIdStr))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        if (!isWithinLectureSchedule(LocalTime.now(), today.getDayOfWeek(), lecture)) {
            throw new CustomException(400, "정규 수업 시간이 아닙니다. 계속 하시겠습니까?");
        }

        List<LectureSession> todaySessions = lectureSessionRepository.findByLectureAndScheduledAtOrderBySessionStartAsc(lecture, today);
        if (todaySessions.stream().anyMatch(s -> s.getStatus() == SessionStatus.IN_PROGRESS)) {
            throw new CustomException(400, "이미 시작된 강의입니다.");
        }

        Long nextSessionNum = todaySessions.stream().map(LectureSession::getSessionNum).filter(num -> num != null).max(Long::compareTo).orElse(0L) + 1L;
        LectureSession newSession = LectureSession.builder().lecture(lecture).scheduledAt(today).sessionNum(nextSessionNum).status(SessionStatus.IN_PROGRESS).sessionStart(LocalDateTime.now()).build();
        lectureSessionRepository.save(newSession);

        return ActionResponse.success(200, "출석 체크가 시작되었습니다.", "/api/professors/lectures/" + lectureIdStr + "/attendance");
    }

    @Transactional
    public ActionResponse endLecture(Long professorId, String lectureIdStr) {
        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureIdStr))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        List<LectureSession> todaySessions = lectureSessionRepository.findByLectureAndScheduledAtOrderBySessionStartAsc(lecture, today);
        List<LectureSession> inProgressSessions = todaySessions.stream().filter(s -> s.getStatus() == SessionStatus.IN_PROGRESS).toList();

        if (inProgressSessions.isEmpty()) throw new CustomException(400, "시작되지 않은 강의는 종료할 수 없습니다.");

        LectureSession session = inProgressSessions.get(inProgressSessions.size() - 1);
        session.setStatus(SessionStatus.ENDED); session.setSessionEnd(LocalDateTime.now());
        lectureSessionRepository.save(session);

        if (!todaySessions.isEmpty()) {
            long totalMinutes = Duration.between(todaySessions.get(0).getSessionStart(), todaySessions.get(todaySessions.size() - 1).getSessionEnd()).toMinutes();
            long actualLectureMinutes = totalMinutes - ((todaySessions.size() - 1) * 10L);

            List<Attendance> attendances = attendanceRepository.findByLectureSessionIn(todaySessions);
            Map<Student, List<Attendance>> attendanceMap = attendances.stream().collect(Collectors.groupingBy(Attendance::getStudent));

            for (Map.Entry<Student, List<Attendance>> entry : attendanceMap.entrySet()) {
                List<Attendance> studentAttendances = entry.getValue();
                LocalDateTime firstEnter = studentAttendances.stream().map(Attendance::getEnterTime).filter(t -> t != null).min(LocalDateTime::compareTo).orElse(null);
                LocalDateTime lastExit = studentAttendances.stream().map(Attendance::getExitTime).filter(t -> t != null).max(LocalDateTime::compareTo).orElse(null);

                if (firstEnter == null || lastExit == null) {
                    for (Attendance a : studentAttendances) { a.setAttendStatus(AttendStatus.ABSENCE); a.setStayRate(0.0); }
                    attendanceRepository.saveAll(studentAttendances); continue;
                }

                double stayRate = (double) Duration.between(firstEnter, lastExit).toMinutes() / actualLectureMinutes * 100.0;
                AttendStatus status = stayRate >= 80.0 ? AttendStatus.ATTEND : stayRate >= 50.0 ? AttendStatus.LATENESS : AttendStatus.ABSENCE;

                for (Attendance a : studentAttendances) {
                    a.setStayRate(Math.round(stayRate * 10.0) / 10.0);
                    a.setAttendStatus(status);
                }
                attendanceRepository.saveAll(studentAttendances);
            }
        }
        return ActionResponse.success(200, "출석 체크가 종료되었습니다.", "/api/professors/lectures/" + lectureIdStr + "/attendance");
    }

    @Transactional
    public ActionResponse updateAttendance(Long professorId, UpdateAttendanceRequest request) {
        Lecture lecture = lectureRepository.findById(Long.valueOf(request.getLectureId()))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        Student student = studentRepository.findByStudentNum(request.getStudentId());
        if (student == null) throw new CustomException(404, "출결을 수정할 학생 정보를 찾을 수 없습니다.");

        LocalDate attendanceDate = request.getDate() != null && !request.getDate().trim().isEmpty() ? LocalDate.parse(request.getDate()) : LocalDate.now();
        List<LectureSession> sessions = lectureSessionRepository.findByLectureAndScheduledAtOrderBySessionStartAsc(lecture, attendanceDate);

        LectureSession session = request.getSessionNum() != null
                ? sessions.stream().filter(s -> request.getSessionNum().equals(s.getSessionNum())).findFirst().orElseThrow(() -> new CustomException(404, "해당 회차의 강의 세션을 찾을 수 없습니다."))
                : (sessions.isEmpty() ? null : sessions.get(sessions.size() - 1));

        if (session == null) throw new CustomException(404, "해당 날짜의 강의 세션을 찾을 수 없습니다.");
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) throw new CustomException(400, "출결 상태값은 필수입니다.");

        String status = request.getStatus().trim().toUpperCase();
        AttendStatus newAttendStatus; AttendanceStatus newRecordStatus;

        switch (status) {
            case "PRESENT": case "ATTEND": newAttendStatus = AttendStatus.ATTEND; newRecordStatus = AttendanceStatus.PRESENT; break;
            case "LATE": case "LATENESS": newAttendStatus = AttendStatus.LATENESS; newRecordStatus = AttendanceStatus.LATE; break;
            case "ABSENT": case "ABSENCE": newAttendStatus = AttendStatus.ABSENCE; newRecordStatus = AttendanceStatus.ABSENT; break;
            default: throw new CustomException(400, "유효하지 않은 출결 상태입니다.");
        }

        Attendance attendance = attendanceRepository.findByLectureSessionAndStudent(session, student).orElseGet(() -> {
            Attendance newA = new Attendance(); newA.setLectureSession(session); newA.setStudent(student); return newA;
        });

        attendance.setAttendStatus(newAttendStatus);
        attendance.setStudentClassStatus(newAttendStatus == AttendStatus.ABSENCE ? StudentClassStatus.AWAY : StudentClassStatus.SIT);
        attendance.setStayRate(newAttendStatus == AttendStatus.ATTEND ? 100.0 : newAttendStatus == AttendStatus.LATENESS ? 50.0 : 0.0);
        attendanceRepository.save(attendance);

        String semester = lecture.getLectureYear() + "-" + lecture.getLectureSemester();
        AttendanceRecord record = attendanceRecordRepository.findByStudentAndLectureAndAttendanceDateAndSemester(student, lecture, attendanceDate, semester)
                .orElseGet(() -> new AttendanceRecord(attendanceDate, semester, AttendanceStatus.TBD, student, lecture));

        record.updateStatus(newRecordStatus);
        attendanceRecordRepository.save(record);

        return ActionResponse.success(200, "출결 상태가 변경되었습니다.", null);
    }

    public AttendanceMonitoringResponse getAttendanceMonitoring(Long professorId, String lectureIdStr, String semester, String dateStr) {
        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureIdStr))
                .filter(l -> l.getProfessor().getProfessorId().equals(professorId))
                .orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));

        List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(lecture.getLectureId());
        LocalDate targetDate = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr) : LocalDate.now();
        List<LectureSession> targetSessions = lectureSessionRepository.findByLectureAndScheduledAtOrderBySessionStartAsc(lecture, targetDate);
        LectureSession targetSession = targetSessions.isEmpty() ? null : targetSessions.get(targetSessions.size() - 1);

        List<AttendanceStudentResponse> studentResponses = new ArrayList<>();
        int totalAttendance = 0, totalLate = 0, totalAway = 0, totalAbsent = 0;

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            List<Attendance> studentAttendances = attendanceRepository.findByLectureSession_LectureAndStudent(lecture, student);

            int presentCount = (int) studentAttendances.stream().filter(a -> a.getAttendStatus() == AttendStatus.ATTEND).count();
            int lateCount = (int) studentAttendances.stream().filter(a -> a.getAttendStatus() == AttendStatus.LATENESS).count();
            int absentCount = (int) studentAttendances.stream().filter(a -> a.getAttendStatus() == AttendStatus.ABSENCE).count();

            AttendStatus currentAttendStatus = AttendStatus.ABSENCE;
            StudentClassStatus currentClassStatus = StudentClassStatus.AWAY;

            if (targetSession != null) {
                Attendance currentAttendance = attendanceRepository.findByLectureSessionAndStudent(targetSession, student).orElse(null);
                if (currentAttendance != null) {
                    currentAttendStatus = currentAttendance.getAttendStatus();
                    currentClassStatus = currentAttendance.getStudentClassStatus();
                }
            }

            if (currentClassStatus == StudentClassStatus.AWAY) totalAway++;
            else if (currentAttendStatus == AttendStatus.ATTEND) totalAttendance++;
            else if (currentAttendStatus == AttendStatus.LATENESS) totalLate++;
            else totalAbsent++;

            int totalSessions = presentCount + lateCount + absentCount;
            double rate = totalSessions == 0 ? 0.0 : Math.round((presentCount * 1000.0 / totalSessions)) / 10.0;
            String currentStatus = convertAttendStatusForResponse(currentAttendStatus, currentClassStatus);

            List<SessionData> sessionResponses = targetSessions.stream().map(ls -> {
                Attendance sa = attendanceRepository.findByLectureSessionAndStudent(ls, student).orElse(null);
                String saStatus = sa == null ? "TBD" : convertAttendStatusForResponse(sa.getAttendStatus(), sa.getStudentClassStatus());
                return SessionData.builder().sessionId(ls.getSessionId()).sessionNum(ls.getSessionNum())
                        .sessionDate(ls.getScheduledAt() != null ? ls.getScheduledAt().toString() : null)
                        .startTime(ls.getScheduledAt() != null ? ls.getSessionStart().toLocalTime().withSecond(0).withNano(0).toString() : null)
                        .endTime(ls.getScheduledAt() != null ? ls.getSessionEnd().toLocalTime().withSecond(0).withNano(0).toString() : null)
                        .status(saStatus).build();
            }).collect(Collectors.toList());

            studentResponses.add(new AttendanceStudentResponse(student.getStudentNum(), student.getStudentName(), currentStatus, presentCount, lateCount, absentCount, totalSessions, rate, sessionResponses));
        }

        int totalStudents = enrollments.size();
        int attendanceRate = totalStudents == 0 ? 0 : (int) Math.round(totalAttendance * 100.0 / totalStudents);

        return new AttendanceMonitoringResponse(targetDate.toString(), targetSession != null ? targetSession.getSessionNum() : null, targetSession != null && targetSession.getStatus() != null ? targetSession.getStatus().name() : "WAIT", attendanceRate, totalLate, totalAway, totalAbsent, studentResponses);
    }

    public OfficialListResponse getAbsences(Long professorId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Official> officialPage = officialRepository.findByProfessor_ProfessorId(professorId, pageable);

        if (officialPage.isEmpty()) return OfficialListResponse.builder().data(new ArrayList<>()).totalElements(0L).totalPages(0).build();

        List<OfficialItemResponse> items = officialPage.getContent().stream().map(official -> OfficialItemResponse.builder()
                .officialId(official.getOfficialId())
                .studentId(official.getStudent() != null ? official.getStudent().getStudentNum() : "00000000")
                .studentName(official.getStudent() != null ? official.getStudent().getStudentName() : "이름없음")
                .course(official.getLecture() != null ? official.getLecture().getLectureName() : "강의명없음")
                .sessionId(official.getLectureSession() != null ? official.getLectureSession().getSessionId() : null)
                .reason(official.getOfficialReason())
                .date(official.getOfficialCreated() != null ? official.getOfficialCreated().toLocalDate().toString() : "")
                .status(official.getStatus() != null ? official.getStatus().name() : "PENDING")
                .fileName(official.getFileName()).build()).collect(Collectors.toList());

        return OfficialListResponse.builder().data(items).totalElements(officialPage.getTotalElements()).totalPages(officialPage.getTotalPages()).build();
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
        officialRepository.save(official);

        // 🌟 [수정] 공결 승인(APPROVED) 시에도 일반 정상 출석(ATTEND / PRESENT)으로 반영
        if (newStatus == Status.APPROVED) {
            Student student = official.getStudent();
            Lecture lecture = official.getLecture();
            LectureSession session = official.getLectureSession();

            if (session != null && student != null && lecture != null) {
                LocalDate attendanceDate = session.getScheduledAt();
                String semester = lecture.getLectureYear() + "-" + lecture.getLectureSemester();

                // 1) 세션 실시간 출결(Attendance) -> ATTEND(출석) 변경
                Attendance attendance = attendanceRepository.findByLectureSessionAndStudent(session, student).orElseGet(() -> {
                    Attendance newA = new Attendance(); newA.setLectureSession(session); newA.setStudent(student); return newA;
                });
                attendance.setAttendStatus(AttendStatus.ATTEND);
                attendance.setStudentClassStatus(StudentClassStatus.SIT);
                attendance.setStayRate(100.0);
                attendanceRepository.save(attendance);

                // 2) 최종 일별 출결 기록(AttendanceRecord) -> PRESENT(정상 출석) 변경
                if (attendanceDate != null) {
                    AttendanceRecord record = attendanceRecordRepository.findByStudentAndLectureAndAttendanceDateAndSemester(student, lecture, attendanceDate, semester)
                            .orElseGet(() -> new AttendanceRecord(attendanceDate, semester, AttendanceStatus.TBD, student, lecture));
                    record.updateStatus(AttendanceStatus.PRESENT);
                    attendanceRecordRepository.save(record);
                }
            }
        }

        return ActionResponse.success(200, "공결 신청이 처리되었습니다.", "/api/professors/absences");
    }

    public ObjectionListResponse getAppeals(Long professorId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Objection> objectionPage = objectionRepository.findByProfessor_ProfessorId(professorId, pageable);

        if (objectionPage.isEmpty()) return ObjectionListResponse.builder().data(new ArrayList<>()).totalElements(0L).totalPages(0).build();

        List<ObjectionItemResponse> items = objectionPage.getContent().stream().map(objection -> ObjectionItemResponse.builder()
                .objectionId(objection.getObjectionId())
                .studentId(objection.getStudent() != null ? objection.getStudent().getStudentNum() : "00000000")
                .studentName(objection.getStudent() != null ? objection.getStudent().getStudentName() : "이름없음")
                .course(objection.getLecture() != null ? objection.getLecture().getLectureName() : "강의명없음")
                .sessionId(objection.getLectureSession() != null ? objection.getLectureSession().getSessionId() : null)
                .reason(objection.getObjectionReason())
                .date(objection.getLectureSession() != null && objection.getLectureSession().getScheduledAt() != null ? objection.getLectureSession().getScheduledAt().toString() : "")
                .status(objection.getStatus() != null ? objection.getStatus().getCode() : "PENDING").build()).collect(Collectors.toList());

        return ObjectionListResponse.builder().data(items).totalElements(objectionPage.getTotalElements()).totalPages(objectionPage.getTotalPages()).build();
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

        // 🌟 이의신청 승인(APPROVED) 시 메인 출결 데이터를 ATTEND / PRESENT(출석)로 변경
        if (newStatus == Status.APPROVED) {
            Student student = objection.getStudent();
            Lecture lecture = objection.getLecture();
            LectureSession session = objection.getLectureSession();

            if (session != null && student != null && lecture != null) {
                LocalDate attendanceDate = session.getScheduledAt();
                String semester = lecture.getLectureYear() + "-" + lecture.getLectureSemester();

                // 1) 세션 실시간 출결(Attendance) -> ATTEND(출석) 변경
                Attendance attendance = attendanceRepository.findByLectureSessionAndStudent(session, student).orElseGet(() -> {
                    Attendance newA = new Attendance(); newA.setLectureSession(session); newA.setStudent(student); return newA;
                });
                attendance.setAttendStatus(AttendStatus.ATTEND);
                attendance.setStudentClassStatus(StudentClassStatus.SIT);
                attendance.setStayRate(100.0);
                attendanceRepository.save(attendance);

                // 2) 최종 일별 출결 기록(AttendanceRecord) -> PRESENT(정상 출석) 변경
                if (attendanceDate != null) {
                    AttendanceRecord record = attendanceRecordRepository.findByStudentAndLectureAndAttendanceDateAndSemester(student, lecture, attendanceDate, semester)
                            .orElseGet(() -> new AttendanceRecord(attendanceDate, semester, AttendanceStatus.TBD, student, lecture));
                    record.updateStatus(AttendanceStatus.PRESENT);
                    attendanceRecordRepository.save(record);
                }
            }
        }

        return ActionResponse.success(200, "이의 신청이 처리되었습니다.", "/api/professors/appeals");
    }

    public Resource downloadAbsenceDocument(Long officialId) {
        Official official = officialRepository.findById(officialId).orElseThrow(() -> new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다."));
        Resource resource = new ClassPathResource(official.getEvidencePath());
        if (!resource.exists()) throw new CustomException(404, "첨부된 증빙서류가 존재하지 않습니다.");
        return resource;
    }

    private String buildScheduleText(Lecture lecture) {
        if (lecture.getLectureDay() == null || lecture.getLectureStart() == null || lecture.getLectureEnd() == null) return "";
        return lecture.getLectureDay() + " " + lecture.getLectureStart() + "-" + lecture.getLectureEnd();
    }

    private boolean isLectureDay(String lectureDay, DayOfWeek today) {
        if (lectureDay == null || lectureDay.trim().isEmpty()) return false;
        return lectureDay.contains(convertDayToKorean(today)) || lectureDay.contains(today.name());
    }

    private boolean isWithinLectureSchedule(LocalTime now, DayOfWeek today, Lecture lecture) {
        if (!isLectureDay(lecture.getLectureDay(), today) || lecture.getLectureStart() == null || lecture.getLectureEnd() == null) return false;
        return !now.isBefore(LocalTime.parse(lecture.getLectureStart().trim())) && !now.isAfter(LocalTime.parse(lecture.getLectureEnd().trim()));
    }

    private String convertDayToKorean(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "월"; case TUESDAY -> "화"; case WEDNESDAY -> "수"; case THURSDAY -> "목"; case FRIDAY -> "금"; case SATURDAY -> "토"; case SUNDAY -> "일";
        };
    }

    private String convertAttendStatusForResponse(AttendStatus attendStatus, StudentClassStatus classStatus) {
        if (attendStatus == AttendStatus.ATTEND) return "ATTEND";
        if (attendStatus == AttendStatus.LATENESS) return "LATENESS";
        if (attendStatus == AttendStatus.ABSENCE) return "ABSENCE";
        return classStatus == StudentClassStatus.AWAY ? "AWAY" : "TBD";
    }

    public byte[] exportAttendance(Long lectureId, Long professorId) {
        Lecture lecture = lectureRepository.findById(lectureId).filter(l -> l.getProfessor().getProfessorId().equals(professorId)).orElseThrow(() -> new CustomException(404, "강의 정보를 찾을 수 없습니다."));
        List<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(lectureId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("출결 통계");
            Row header = sheet.createRow(0);
            String[] headers = {"학번", "이름", "출석", "지각", "결석", "총 출결 수", "출석률"};
            for (int i = 0; i < headers.length; i++) header.createCell(i).setCellValue(headers[i]);

            int rowIndex = 1;
            for (Enrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                List<AttendanceRecord> records = attendanceRecordRepository.findByStudentAndLectureAndSemester(student, lecture, lecture.getLectureYear() + "-" + lecture.getLectureSemester());

                long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.EXCUSED).count();
                long lateCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
                long absentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
                long totalCount = presentCount + lateCount + absentCount;
                double attendanceRate = totalCount == 0 ? 0.0 : Math.round((presentCount * 1000.0 / totalCount)) / 10.0;

                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(student.getStudentNum()); row.createCell(1).setCellValue(student.getStudentName());
                row.createCell(2).setCellValue(presentCount); row.createCell(3).setCellValue(lateCount); row.createCell(4).setCellValue(absentCount);
                row.createCell(5).setCellValue(totalCount); row.createCell(6).setCellValue(attendanceRate + "%");
            }

            for (int i = 0; i <= 6; i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new CustomException(500, "데이터 파일 생성에 실패했습니다.");
        }
    }
}