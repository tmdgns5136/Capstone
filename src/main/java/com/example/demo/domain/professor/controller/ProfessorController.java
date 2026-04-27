package com.example.demo.domain.professor.controller;

import com.example.demo.domain.professor.dto.ProfessorDashboardResponse;
import com.example.demo.domain.professor.dto.ProfessorLectureResponse;
import com.example.demo.domain.professor.dto.TodayLectureResponse;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.professor.service.ProfessorService;
import com.example.demo.domain.attendance.dto.UpdateAttendanceRequest;
import com.example.demo.domain.attendance.dto.AttendanceMonitoringResponse;
import com.example.demo.domain.lecture.dto.dto.OfficialListResponse;
import com.example.demo.domain.lecture.dto.dto.ProcessOfficialRequest;
import com.example.demo.domain.lecture.dto.dto.ObjectionListResponse;
import com.example.demo.domain.lecture.dto.dto.ProcessObjectionRequest;
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
    public ApiResponse<List<ProfessorLectureResponse>> getLectures(Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return ApiResponse.success(200, professorService.getLectures(professor.getProfessorId()));
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
            @PathVariable("lectureId") Long lectureId,
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        return ApiResponse.success(200,
                professorService.getQuestions(lectureId, page, size));
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
            @RequestParam("semester") String semester, Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);
        return ApiResponse.success(200,
                professorService.getAttendanceMonitoring(professor.getProfessorId(), lectureId, semester)
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
}