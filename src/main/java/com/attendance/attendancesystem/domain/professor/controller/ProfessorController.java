package com.attendance.attendancesystem.domain.professor.controller;

import com.attendance.attendancesystem.domain.professor.dto.ProfessorDashboardResponse;
import com.attendance.attendancesystem.domain.professor.dto.ProfessorLectureResponse;
import com.attendance.attendancesystem.domain.professor.dto.TodayLectureResponse;
import com.attendance.attendancesystem.domain.professor.service.ProfessorService;
import com.attendance.attendancesystem.global.response.ActionResponse;
import com.attendance.attendancesystem.global.response.ApiResponse;
import com.attendance.attendancesystem.domain.attendance.dto.UpdateAttendanceRequest;
import com.attendance.attendancesystem.domain.attendance.dto.AttendanceMonitoringResponse;
import com.attendance.attendancesystem.domain.absence.dto.AbsenceListResponse;
import com.attendance.attendancesystem.domain.absence.dto.ProcessAbsenceRequest;
import com.attendance.attendancesystem.domain.appeal.dto.AppealListResponse;
import com.attendance.attendancesystem.domain.appeal.dto.ProcessAppealRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/professors")
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    // 로그인 붙기 전까지 임시 고정값
    private Long getCurrentProfessorId() {
        return 1L;
    }

    @GetMapping("/lectures")
    public ApiResponse<List<ProfessorLectureResponse>> getLectures() {
        return ApiResponse.success(professorService.getLectures(getCurrentProfessorId()));
    }

    @GetMapping("/lectures/today")
    public ApiResponse<List<TodayLectureResponse>> getTodayLectures() {
        return ApiResponse.success(professorService.getTodayLectures(getCurrentProfessorId()));
    }

    @GetMapping("/dashboard")
    public ApiResponse<ProfessorDashboardResponse> getDashboard() {
        return ApiResponse.success(professorService.getDashboard(getCurrentProfessorId()));
    }

    @PostMapping("/lectures/{lectureId}/start")
    public ActionResponse startLecture(@PathVariable("lectureId") String lectureId) {
        return professorService.startLecture(getCurrentProfessorId(), lectureId);
    }

    @PostMapping("/lectures/{lectureId}/end")
    public ActionResponse endLecture(@PathVariable("lectureId") String lectureId) {
        return professorService.endLecture(getCurrentProfessorId(), lectureId);
    }

    @PatchMapping("/attendance")
    public ActionResponse updateAttendance(@RequestBody UpdateAttendanceRequest request) {
        return professorService.updateAttendance(getCurrentProfessorId(), request);
    }

    @GetMapping("/lectures/{lectureId}/attendance")
    public ApiResponse<AttendanceMonitoringResponse> getAttendanceMonitoring(
            @PathVariable("lectureId") String lectureId,
            @RequestParam("semester") String semester
    ) {
        return ApiResponse.success(
                professorService.getAttendanceMonitoring(getCurrentProfessorId(), lectureId, semester)
        );
    }

    @GetMapping("/absences")
    public ApiResponse<AbsenceListResponse> getAbsences(
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        return ApiResponse.success(professorService.getAbsences(page, size));
    }

    @PatchMapping("/absences/{absenceId}")
    public ActionResponse processAbsence(
            @PathVariable("absenceId") Long absenceId,
            @RequestBody ProcessAbsenceRequest request
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
    public ApiResponse<AppealListResponse> getAppeals(
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        return ApiResponse.success(professorService.getAppeals(page, size));
    }

    @PatchMapping("/appeals/{appealId}")
    public ActionResponse processAppeal(
            @PathVariable("appealId") Long appealId,
            @RequestBody ProcessAppealRequest request
    ) {
        return professorService.processAppeal(appealId, request);
    }
}