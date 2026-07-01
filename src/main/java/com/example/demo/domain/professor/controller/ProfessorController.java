package com.example.demo.domain.professor.controller;

import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.Files;
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
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.repository.LectureRepository;
import com.example.demo.global.exception.CustomException;
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
    private final LectureRepository lectureRepository;

    @GetMapping("/lectures")
    public ApiResponse<List<ProfessorLectureResponse>> getLectures(
            @RequestParam(value = "semester", required = false) String semester,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.success(200, professorService.getLectures(professor.getProfessorId(), semester));
    }

    @GetMapping("/lectures/today")
    public ApiResponse<List<TodayLectureResponse>> getTodayLectures(Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.success(200, professorService.getTodayLectures(professor.getProfessorId()));
    }

    @GetMapping("/dashboard")
    public ApiResponse<ProfessorDashboardResponse> getDashboard(Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

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

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return professorService.createNotice(lectureId, title, content);
    }

    @PatchMapping("/notices/{noticeId}")
    public ActionResponse updateNotice(
            @PathVariable("noticeId") Long noticeId,
            @RequestParam("title") String title,
            @RequestParam("content") String content
    ) {
        return professorService.updateNotice(noticeId, title, content);
    }

    @DeleteMapping("/notices/{noticeId}")
    public ActionResponse deleteNotice(@PathVariable("noticeId") Long noticeId) {
        return professorService.deleteNotice(noticeId);
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

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.success(200,
                professorService.getNotices(lectureId, page, size));
    }

    @GetMapping("/lectures/{lectureId}/questions")
    public ApiResponse<Map<String, Object>> getQuestions(
            @PathVariable("lectureId") String lectureId,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        try {
            Long id = Long.valueOf(lectureId);

            return ApiResponse.success(200,
                    professorService.getQuestions(id, page, size));
        } catch (NumberFormatException e) {
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

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

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

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

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

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return professorService.updateAnswer(questionId, request.get("content"));
    }

    @DeleteMapping("/answers/{questionId}")
    public ActionResponse deleteAnswer(
            @PathVariable("questionId") Long questionId,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return professorService.deleteAnswer(questionId);
    }

    @PostMapping("/lectures/{lectureId}/start")
    public ActionResponse startLecture(@PathVariable("lectureId") String lectureId, Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return professorService.startLecture(professor.getProfessorId(), lectureId);
    }

    @PostMapping("/lectures/{lectureId}/end")
    public ActionResponse endLecture(@PathVariable("lectureId") String lectureId, Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return professorService.endLecture(professor.getProfessorId(), lectureId);
    }

    @PatchMapping("/attendance")
    public ActionResponse updateAttendance(@RequestBody UpdateAttendanceRequest request, Authentication authentication) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return professorService.updateAttendance(professor.getProfessorId(), request);
    }

    @GetMapping("/lectures/{lectureId}/attendance")
    public ApiResponse<AttendanceMonitoringResponse> getAttendanceMonitoring(
            @PathVariable("lectureId") String lectureId,
            @RequestParam("semester") String semester,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "sessionNum", required = false) Long sessionNum,
            Authentication authentication
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.success(200,
                professorService.getAttendanceMonitoring(
                        professor.getProfessorId(),
                        lectureId,
                        semester,
                        date,
                        sessionNum
                )
        );
    }

    @GetMapping("/absences")
    public ApiResponse<OfficialListResponse> getAbsences(
            Authentication authentication,
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.success(200, professorService.getAbsences(professor, page, size));
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

    @GetMapping("/appeals/{objectionId}/document") // 🌟 공결(/absences/{id}/document)과 100% 동일한 주소 규격!
    public ResponseEntity<Resource> downloadAppealDocument(@PathVariable("objectionId") Long objectionId) {
        // 공결 구조와 똑같이 고친 서비스 메서드 호출
        Resource resource = professorService.downloadAppealDocument(objectionId);

        // 🌟 복잡한 파일명 가공 없이 공결 리턴 양식 그대로 토시 하나 안 틀리고 반환합니다.
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/appeals")
    public ApiResponse<ObjectionListResponse> getAppeals(
            Authentication authentication,
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        String professorNum = authentication.getName();
        Professor professor = professorRepository.findByProfessorNum(professorNum);

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.success(200, professorService.getAppeals(professor.getProfessorId(), page, size));
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

        if (professor == null) {
            throw new CustomException(404, "교수 정보를 찾을 수 없습니다.");
        }

        byte[] excelFile = professorService.exportAttendance(lectureId, professor.getProfessorId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelFile);
    }
}