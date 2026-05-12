package com.example.demo.domain.professor.controller;

import com.example.demo.domain.professor.dto.ProfessorDashboardResponse;
import com.example.demo.domain.professor.dto.ProfessorLectureResponse;
import com.example.demo.domain.professor.dto.TodayLectureResponse;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.professor.service.ProfessorService;
import com.example.demo.domain.attendance.dto.UpdateAttendanceRequest;
import com.example.demo.domain.attendance.dto.AttendanceMonitoringResponse;
import com.example.demo.domain.student.lecture.attendance.dto.OfficialListResponse;
import com.example.demo.domain.student.lecture.attendance.dto.ProcessOfficialRequest;
import com.example.demo.domain.student.lecture.attendance.dto.ObjectionListResponse;
import com.example.demo.domain.student.lecture.attendance.dto.ProcessObjectionRequest;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorController {
    private final ProfessorRepository professorRepository;
    private final ProfessorService professorService;



    @GetMapping("/lectures")
    public ApiResponse<List<ProfessorLectureResponse>> getLectures(
            @RequestParam(value = "semester", required = false) String semester,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return ApiResponse.success(200, professorService.getLectures(professor.getProfessorId(), semester));
    }

    @GetMapping("/lectures/today")
    public ApiResponse<List<TodayLectureResponse>> getTodayLectures(Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return ApiResponse.success(200, professorService.getTodayLectures(professor.getProfessorId()));
    }

    @GetMapping("/dashboard")
    public ApiResponse<ProfessorDashboardResponse> getDashboard(Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return ApiResponse.success(200, professorService.getDashboard(professor.getProfessorId()));
    }

    @PostMapping("/lectures/{lectureId}/notices")
    public ActionResponse createNotice(
            @PathVariable("lectureId") Long lectureId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return professorService.createNotice(lectureId, title, content);
    }

    // ProfessorController.java에 추가
    @PatchMapping("/notices/{noticeId}")
    public ActionResponse updateNotice(
            @PathVariable("noticeId") Long noticeId,
            @RequestParam("title") String title,
            @RequestParam("content") String content
    ) {
        // 서비스의 수정 로직 호출
        return professorService.updateNotice(noticeId, title, content);
    }

    @GetMapping("/lectures/{lectureId}/notices")
    public ApiResponse<Map<String, Object>> getNotices(
            @PathVariable("lectureId") Long lectureId,
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return ApiResponse.success(200,
                professorService.getNotices(lectureId, page, size));
    }

    @GetMapping("/lectures/{lectureId}/questions")
    public ApiResponse<Map<String, Object>> getQuestions(
            @PathVariable("lectureId") String lectureId, // 프론트의 "1"을 받음
            @RequestParam(value = "page", defaultValue = "1") int page, // 필수값 에러 방지
            @RequestParam(value = "size", defaultValue = "10") int size, // 필수값 에러 방지
            Authentication authentication
    ) {
        // 1. 로그인한 교수 정보 가져오기
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        // 2. [핵심] lectureId가 숫자인지 확인하고 서비스 호출
        try {
            // String "1" -> Long 1L로 변환
            Long id = Long.valueOf(lectureId);

            return ApiResponse.success(200,
                    professorService.getQuestions(id, page, size));
        } catch (NumberFormatException e) {
            // 혹시 주소창에 숫자가 아닌 "undefined" 같은 게 들어왔을 때 서버가 안 죽게 방어
            throw new com.example.demo.global.exception.CustomException(400, "유효하지 않은 강의 번호입니다: " + lectureId);
        }
    }

    @GetMapping("/lectures/{lectureId}/questions/{questionId}")
    public ApiResponse<Map<String, Object>> getQuestionDetail(
            @PathVariable("lectureId") Long lectureId,
            @PathVariable("questionId") Long questionId,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return ApiResponse.success(200,
                professorService.getQuestionDetail(lectureId, questionId));
    }

    @PostMapping("/questions/{questionId}/answer")
    public ActionResponse createAnswer(
            @PathVariable("questionId") Long questionId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return professorService.createAnswer(questionId, request.get("content"));
    }

    @PatchMapping("/answers/{questionId}")
    public ActionResponse updateAnswer(
            @PathVariable("questionId") Long questionId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return professorService.updateAnswer(questionId, request.get("content"));
    }

    @DeleteMapping("/answers/{questionId}")
    public ActionResponse deleteAnswer(
            @PathVariable("questionId") Long questionId,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return professorService.deleteAnswer(questionId);
    }

    @PostMapping("/lectures/{lectureId}/start")
    public ActionResponse startLecture(@PathVariable("lectureId") String lectureId, Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return professorService.startLecture(professor.getProfessorId(), lectureId);
    }

    @PostMapping("/lectures/{lectureId}/end")
    public ActionResponse endLecture(@PathVariable("lectureId") String lectureId, Authentication authentication){
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return professorService.endLecture(professor.getProfessorId(), lectureId);
    }

    @PatchMapping("/attendance")
    public ActionResponse updateAttendance(@RequestBody UpdateAttendanceRequest request, Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return professorService.updateAttendance(professor.getProfessorId(), request);
    }

    @GetMapping("/lectures/{lectureId}/attendance")
    public ApiResponse<AttendanceMonitoringResponse> getAttendanceMonitoring(
            @PathVariable("lectureId") String lectureId,
            @RequestParam("semester") String semester,
            // 1. [추가] 리액트에서 보낸 날짜를 받을 수 있게 파라미터 추가
            @RequestParam(value = "date", required = false) String date,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        // 2. [수정] 서비스 호출 시 마지막에 date를 꼭 넣어줘야 합니다! (4번째 파라미터)
        return ApiResponse.success(200,
                professorService.getAttendanceMonitoring(professor.getProfessorId(), lectureId, semester, date)
        );
    }

    @GetMapping("/absences")
    public ApiResponse<OfficialListResponse> getAbsences(
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        return ApiResponse.success(200, professorService.getAbsences(page, size));
    }

    @PatchMapping("/absences/{absenceId}")
    public ActionResponse processAbsence(
            @PathVariable("absenceId") Long absenceId,
            @RequestBody ProcessOfficialRequest request
    ) {
        return professorService.processAbsence(absenceId, request);
    }

    @GetMapping("/absences/{absenceId}/document")
    public ResponseEntity<Resource> downloadAbsenceDocument(@PathVariable("absenceId") Long absenceId) {
        Resource resource = professorService.downloadAbsenceDocument(absenceId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/appeals")
    public ApiResponse<ObjectionListResponse> getAppeals(
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        return ApiResponse.success(200, professorService.getAppeals(page, size));
    }

    @PatchMapping("/appeals/{appealId}")
    public ActionResponse processAppeal(
            @PathVariable("appealId") Long appealId,
            @RequestBody ProcessObjectionRequest request
    ) {
        return professorService.processAppeal(appealId, request);
    }

    @GetMapping("/lectures/{lectureId}/export")
    public ResponseEntity<byte[]> exportAttendance(
            @PathVariable("lectureId") Long lectureId,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        byte[] excelFile = professorService.exportAttendance(lectureId, professor.getProfessorId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelFile);
    }
}