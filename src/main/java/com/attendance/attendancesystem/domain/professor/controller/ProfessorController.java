package com.attendance.attendancesystem.domain.professor.controller;

import com.attendance.attendancesystem.domain.professor.dto.ProfessorDashboardResponse;
import com.attendance.attendancesystem.domain.professor.dto.ProfessorLectureResponse;
import com.attendance.attendancesystem.domain.professor.dto.TodayLectureResponse;
import com.attendance.attendancesystem.domain.professor.service.ProfessorService;
import com.attendance.attendancesystem.global.response.ActionResponse;
import com.attendance.attendancesystem.global.response.ApiResponse;
import org.springframework.web.bind.annotation.*;

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
}