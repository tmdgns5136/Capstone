package com.example.demo.domain.lecture.service;

import com.example.demo.domain.enumerate.AttendStatus;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.lecture.attendance.dto.*;
import com.example.demo.domain.lecture.attendance.dto.OfficialDto;
import com.example.demo.domain.lecture.attendance.repository.AttendanceRepository;
import com.example.demo.domain.lecture.attendance.repository.ObjectionRepository;
import com.example.demo.domain.lecture.attendance.repository.OfficialRepository;
import com.example.demo.domain.lecture.board.repository.QuestionBoardRepository;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.home.repository.StudentRepository;
import com.example.demo.domain.home.service.FileService;
import com.example.demo.domain.home.util.FileUtil;
import com.example.demo.domain.lecture.dto.*;
import com.example.demo.domain.lecture.attendance.entity.Attendance;
import com.example.demo.domain.lecture.attendance.entity.Objection;
import com.example.demo.domain.lecture.attendance.entity.Official;
import com.example.demo.domain.lecture.entity.Enrollment;
import com.example.demo.domain.lecture.entity.Lecture;
import com.example.demo.domain.lecture.entity.LectureSession;
import com.example.demo.domain.lecture.repository.*;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LectureService {
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository lectureRepository;
    private final OfficialRepository officialRepository;
    private final ObjectionRepository objectionRepository;
    private final LectureSessionRepository lectureSessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final QuestionBoardRepository questionBoardRepository;
    private final FileService fileService;
    private final FileUtil fileUtil;

    public ApiResponse<List<LectureData>> getMyLecture(Authentication authentication, Long year, String semester){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        List<LectureData>lectureDataList = enrollments.stream()
                .map(Enrollment::getLecture)
                .filter(lecture -> lecture.getLectureYear().equals(year))
                .filter(lecture -> lecture.getLectureSemester().equals(semester))
                .map(lecture -> {
                    Professor professor = lecture.getProfessor();

                    return LectureData.builder()
                            .lectureId(lecture.getLectureId())
                            .lectureCode(lecture.getLectureCode())
                            .lectureName(lecture.getLectureName())
                            .professorName(professor.getProfessorName()).build();
                }).toList();

        return ApiResponse.success(200, lectureDataList);
    }

    public OfficialDto mapToOfficialDto(Official official){
        return OfficialDto.builder()
                .officialId(official.getOfficialId())
                .officialTitle(official.getOfficialTitle())
                .officialReason(official.getOfficialReason())
                .evidencePath(official.getEvidencePath())
                .rejectedReason(official.getRejectedReason())
                .officialCreated(official.getOfficialCreated())
                .status(official.getStatus()).build();

    }

    public ObjectionDto mapToObjectionDto(Objection objection){
        return ObjectionDto.builder()
                .objectionId(objection.getObjectionId())
                .objectionTitle(objection.getObjectionTitle())
                .objectionReason(objection.getObjectionReason())
                .evidencePath(objection.getEvidencePath())
                .rejectedReason(objection.getRejectedReason())
                .objectionCreated(objection.getObjectionCreated())
                .status(objection.getStatus()).build();

    }

    @Transactional
    public OfficialDto createOfficialAbsence(Authentication authentication, AbsenceRequest request, MultipartFile evidenceFile, Long lectureId) throws IOException {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        LectureSession session = lectureSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new CustomException(404, "해당 수업 세션을 찾을 수 없습니다."));

        String savedPath = fileService.saveEvidenceFile(evidenceFile, "official");
        Official official = Official.builder()
                .officialTitle(request.getTitle())
                .officialReason(request.getReason())
                .evidencePath("/uploads/official/" + savedPath)
                .status(Status.PENDING)
                .lectureSession(session)
                .student(student)
                .lecture(lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."))).build();

        Official savedOfficial = officialRepository.save(official);
        return mapToOfficialDto(savedOfficial);
    }

    public ApiResponse<AbsenceData> applyOfficialAbsence(Authentication authentication, AbsenceRequest request, MultipartFile evidenceFile, Long lectureId) throws IOException {
        OfficialDto officialDto = createOfficialAbsence(authentication, request, evidenceFile, lectureId);

        AbsenceData absenceData = AbsenceData.builder().requestId(officialDto.getOfficialId())
                .status(officialDto.getStatus().getCode()).build();

        return ApiResponse.success(200, absenceData, "공결 신청이 정상적으로 접수되었습니다.");
    }

    public ApiResponse<List<AbsenceRequestData>> getMyOfficialRequests(Authentication authentication, Long lectureId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        List<Official> officialList = officialRepository.findByStudentAndLecture(student, lecture);

        List<AbsenceRequestData> requestDataList = officialList.stream()
                .map(official -> AbsenceRequestData.builder()
                        .requestId(official.getOfficialId())
                        .title(official.getOfficialTitle())
                        .status(official.getStatus().getCode())
                        .requestDate(official.getOfficialCreated().toLocalDate().toString()).build()).toList();

        return ApiResponse.success(200, requestDataList);

    }

    public ApiResponse<AbsenceDetailData> getMyDetailOfficialRequests(Authentication authentication, Long lectureId, Long requestId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        Official official = officialRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 공결신청 내역을 찾을 수 없습니다."));

        if (!official.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 삭제할 권한이 없습니다.");
        }

        AbsenceDetailData absenceDetailData = AbsenceDetailData.builder()
                .requestId(official.getOfficialId())
                .title(official.getOfficialTitle())
                .reason(official.getOfficialReason())
                .status(official.getStatus().getCode())
                .requestData(official.getOfficialCreated().toLocalDate().toString())
                .sessionId(official.getLectureSession() != null ? official.getLectureSession().getSessionId() : null)
                .evidenceFileUrl(official.getEvidencePath()).build();

        return ApiResponse.success(200, absenceDetailData);

    }

    @Transactional
    public ApiResponse<AbsenceData> modifyOfficialRequest(Authentication authentication, Long lectureId, Long requestId, AbsenceRequest request, MultipartFile evidenceFile) throws IOException {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        Official official = officialRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 공결신청 내역을 찾을 수 없습니다."));

        if (!official.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 수정할 권한이 없습니다.");
        }

        if(!official.getStatus().getCode().equals("PENDING")){
            throw  new CustomException(400, "이미 처리가 완료된 신청은 수정할 수 없습니다.");
        }

        if (request.getSessionId() != null) {
            LectureSession session = lectureSessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new CustomException(404, "해당 수업 세션을 찾을 수 없습니다."));
            official.setLectureSession(session);
        }

        if(request.getTitle() != null){
            official.setOfficialTitle(request.getTitle());
        }

        if(request.getReason() != null){
            official.setOfficialReason(request.getReason());
        }

        if (request.getSessionId() != null) {
            LectureSession session = lectureSessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new CustomException(404, "해당 수업 세션을 찾을 수 없습니다."));
            official.setLectureSession(session);
        }

        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            String oldFullPath = System.getProperty("user.dir") + official.getEvidencePath();
            fileUtil.deleteFileByFilePath(oldFullPath);

            // 2. 새 파일 저장 (아까 수정한 대로 "official" 인자 추가!)
            String savedFileName = fileService.saveEvidenceFile(evidenceFile, "official");
            official.setEvidencePath("/uploads/official/" + savedFileName);
        }

        AbsenceData absenceData = AbsenceData.builder().requestId(requestId)
                .status(official.getStatus().getCode()).build();

        return ApiResponse.success(200, absenceData, "공결 신청이 수정되었습니다. 담당 교수 승인 후 처리됩니다.");

    }

    @Transactional
    public ActionResponse deleteOfficialRequest(Authentication authentication, Long lectureId, Long requestId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        Official official = officialRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 공결신청 내역을 찾을 수 없습니다."));

        if (!official.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 삭제할 권한이 없습니다.");
        }

        if(!official.getStatus().getCode().equals("PENDING")){
            throw  new CustomException(400, "이미 처리가 완료된 신청은 취소할 수 없습니다.");
        }
        String fullPath = System.getProperty("user.dir") + official.getEvidencePath();
        fileUtil.deleteFileByFilePath(fullPath);

        officialRepository.delete(official);
        return ActionResponse.success(200, "공결 신청이 취소되었습니다.",
                "api/mylecture/" + lectureId + "/official-requests");

    }

    @Transactional
    public ObjectionDto createObjectionAbsence(Authentication authentication, AbsenceRequest request, MultipartFile evidenceFile, Long lectureId) throws IOException {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        LectureSession session = lectureSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new CustomException(404, "해당 수업 세션을 찾을 수 없습니다."));

        String savedPath = fileService.saveEvidenceFile(evidenceFile, "objection");
        Objection objection = Objection.builder()
                .objectionTitle(request.getTitle())
                .objectionReason(request.getReason())
                .evidencePath("/uploads/objection/" + savedPath)
                .status(Status.PENDING)
                .lectureSession(session)
                .student(student)
                .lecture(lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."))).build();

        Objection savedObjection = objectionRepository.save(objection);
        return mapToObjectionDto(savedObjection);
    }

    public ApiResponse<AbsenceData> applyObjectionAbsence(Authentication authentication, AbsenceRequest request, MultipartFile evidenceFile, Long lectureId) throws IOException {
        ObjectionDto objectionDto = createObjectionAbsence(authentication, request, evidenceFile, lectureId);

        AbsenceData absenceData = AbsenceData.builder().requestId(objectionDto.getObjectionId())
                .status(objectionDto.getStatus().getCode()).build();

        return ApiResponse.success(200, absenceData, "출결 이의 신청이 정상적으로 접수되었습니다.");
    }

    public ApiResponse<List<AbsenceRequestData>> getMyObjectionRequests(Authentication authentication, Long lectureId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        List<Objection> objectionList = objectionRepository.findByStudentAndLecture(student, lecture);

        List<AbsenceRequestData> requestDataList = objectionList.stream()
                .map(objection -> AbsenceRequestData.builder()
                        .requestId(objection.getObjectionId())
                        .title(objection.getObjectionTitle())
                        .status(objection.getStatus().getCode())
                        .requestDate(objection.getObjectionCreated().toLocalDate().toString()).build()).toList();

        return ApiResponse.success(200, requestDataList);

    }

    public ApiResponse<AbsenceDetailData> getMyDetailObjectionRequests(Authentication authentication, Long lectureId, Long requestId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        Objection objection = objectionRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 공결신청 내역을 찾을 수 없습니다."));

        if (!objection.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 삭제할 권한이 없습니다.");
        }

        AbsenceDetailData absenceDetailData = AbsenceDetailData.builder()
                .requestId(objection.getObjectionId())
                .title(objection.getObjectionTitle())
                .reason(objection.getObjectionReason())
                .status(objection.getStatus().getCode())
                .requestData(objection.getObjectionCreated().toLocalDate().toString())
                .sessionId(objection.getLectureSession() != null ? objection.getLectureSession().getSessionId() : null)
                .evidenceFileUrl(objection.getEvidencePath()).build();

        return ApiResponse.success(200, absenceDetailData);

    }

    @Transactional
    public ApiResponse<AbsenceData> modifyObjectionRequest(Authentication authentication, Long lectureId, Long requestId, AbsenceRequest request, MultipartFile evidenceFile) throws IOException {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        Objection objection = objectionRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 공결신청 내역을 찾을 수 없습니다."));

        if (!objection.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 수정할 권한이 없습니다.");
        }

        if(!objection.getStatus().getCode().equals("PENDING")){
            throw  new CustomException(400, "이미 처리가 완료된 신청은 수정할 수 없습니다.");
        }

        if(request.getTitle() != null){
            objection.setObjectionTitle(request.getTitle());
        }

        if(request.getReason() != null){
            objection.setObjectionReason(request.getReason());
        }

        if (request.getSessionId() != null) {
            LectureSession session = lectureSessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new CustomException(404, "해당 수업 세션을 찾을 수 없습니다."));
            objection.setLectureSession(session);
        }

        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            String oldFullPath = System.getProperty("user.dir") + objection.getEvidencePath();
            fileUtil.deleteFileByFilePath(oldFullPath);

            // 2. 새 파일 저장 (아까 수정한 대로 "official" 인자 추가!)
            String savedFileName = fileService.saveEvidenceFile(evidenceFile, "official");
            objection.setEvidencePath("/uploads/official/" + savedFileName);
        }

        AbsenceData absenceData = AbsenceData.builder().requestId(requestId)
                .status(objection.getStatus().getCode()).build();

        return ApiResponse.success(200, absenceData, "출결 이의 신청이 수정되었습니다. 담당 교수 승인 후 처리됩니다.");

    }

    @Transactional
    public ActionResponse deleteObjectionRequest(Authentication authentication, Long lectureId, Long requestId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        Objection objection = objectionRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 이의신청 내역을 찾을 수 없습니다."));

        if (!objection.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 삭제할 권한이 없습니다.");
        }

        if(!objection.getStatus().getCode().equals("PENDING")){
            throw  new CustomException(400, "이미 처리가 완료된 신청은 취소할 수 없습니다.");
        }
        String fullPath = System.getProperty("user.dir") + objection.getEvidencePath();
        fileUtil.deleteFileByFilePath(fullPath);

        objectionRepository.delete(objection);
        return ActionResponse.success(200, "출결 이의 신청이 취소되었습니다.",
                "api/mylecture/" + lectureId + "/official-requests");

    }

    public ApiResponse<List<SessionData>> getLectureSessions(Authentication authentication, Long lectureId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        List<LectureSession> lectureSessions = lectureSessionRepository.findByLecture(lecture);

        List<Attendance> myAttendances = attendanceRepository.findByLectureSession_LectureAndStudent(lecture, student);

        List<SessionData> sessionDataList = lectureSessions.stream()
                .map(session -> {
                    AttendStatus currentStatus = myAttendances.stream()
                            .filter((attendance -> attendance.getLectureSession().getSessionId().equals(session.getSessionId())))
                            .map(Attendance::getAttendStatus)
                            .findFirst().orElse(AttendStatus.TBD);


                    return SessionData.builder()
                            .sessionId(session.getSessionId())
                            .sessionNum(session.getSessionNum())
                            .sessionDate(session.getScheduledAt().toString())
                            .startTime(session.getSessionStart().toLocalTime().toString())
                            .endTime(session.getSessionEnd().toLocalTime().toString())
                            .status(currentStatus.toString()).build();
                }).toList();

        return ApiResponse.success(200, sessionDataList);

    }

    public ApiResponse<StatsData> getStats(Authentication authentication, Long lectureId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        List<LectureSession> lectureSessions = lectureSessionRepository.findByLecture(lecture);

        List<Attendance> myAttendances = attendanceRepository.findByLectureSession_LectureAndStudent(lecture, student);

        List<SessionData> sessionDataList = lectureSessions.stream()
                .map(session -> {
                    AttendStatus currentStatus = myAttendances.stream()
                            .filter((attendance -> attendance.getLectureSession().getSessionId().equals(session.getSessionId())))
                            .map(Attendance::getAttendStatus)
                            .findFirst().orElse(AttendStatus.TBD);

                    String sDate = (session.getScheduledAt() != null) ? session.getScheduledAt().toString() : "날짜 미정";
                    String sStart = (session.getSessionStart() != null) ? session.getSessionStart().toLocalTime().toString() : "00:00";
                    String sEnd = (session.getSessionEnd() != null) ? session.getSessionEnd().toLocalTime().toString() : "00:00";


                    return SessionData.builder()
                            .sessionId(session.getSessionId())
                            .sessionNum(session.getSessionNum())
                            .sessionDate(sDate)
                            .startTime(sStart)
                            .endTime(sEnd)
                            .status(currentStatus.toString()).build();
                }).toList();

        long totalSessions = myAttendances.stream().filter(a->a.getAttendStatus()!=AttendStatus.TBD).count();
        long attendance = myAttendances.stream().filter(a -> a.getAttendStatus() == AttendStatus.ATTEND).count();
        long absence = myAttendances.stream().filter(a -> a.getAttendStatus() == AttendStatus.ABSENCE).count();
        long late = myAttendances.stream().filter(a -> a.getAttendStatus() == AttendStatus.LATENESS).count();

        double rate = (totalSessions > 0) ? ((double) attendance / totalSessions) * 100 : 0.0;

        StatsData statsData = StatsData.builder()
                .totalSessions(totalSessions)
                .attendance(attendance)
                .absence(absence)
                .late(late)
                .attendanceRate(rate)
                .sessions(sessionDataList).build();

        return ApiResponse.success(200, statsData);

    }

    public ApiResponse<List<LectureTimeTable>> getLectureTimeTable(Authentication authentication, Long year, String semester){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        List<LectureTimeTable> LectureTimeTables = enrollments.stream()
                .map(Enrollment::getLecture)
                .filter(lecture -> lecture.getLectureYear().equals(year))
                .filter(lecture -> lecture.getLectureSemester().equals(semester))
                .map(lecture -> {

                    return LectureTimeTable.builder()
                            .lectureCode(lecture.getLectureCode())
                            .lectureName(lecture.getLectureName())
                            .day(lecture.getLectureDay())
                            .startTime(lecture.getLectureStart())
                            .endTime(lecture.getLectureEnd())
                            .room(lecture.getLectureRoom()).build();
                }).toList();

        return ApiResponse.success(200, LectureTimeTables);
    }


}
