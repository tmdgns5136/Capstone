package com.example.demo.domain.student.lecture.controller;

import com.example.demo.domain.student.lecture.service.LectureService;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceData;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceDetailData;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceRequest;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceRequestData;
import com.example.demo.domain.student.lecture.dto.LectureData;
import com.example.demo.domain.student.lecture.dto.LectureTimeTable;
import com.example.demo.domain.student.lecture.dto.SessionData;
import com.example.demo.domain.student.lecture.dto.StatsData;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/mylecture")
@RequiredArgsConstructor
public class LectureController {
    private final LectureService lectureService;

    // 내 강의 탭
    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureData>>> getMyLecture(@RequestParam Long year,
                                                                       @RequestParam String semester,
                                                                       Authentication authentication){
        ApiResponse<List<LectureData>> apiResponse = lectureService.getMyLecture(authentication, year, semester);
        return ResponseEntity.ok(apiResponse);
    }

    // 공결 신청
    @PostMapping("/{lecture_id}/official-absence")
    public ResponseEntity<ApiResponse<AbsenceData>> applyOfficialAbsence(@PathVariable("lecture_id") Long lectureId,
                                                                         @RequestPart("request") AbsenceRequest request,
                                                                         @RequestPart("evidenceFile") MultipartFile evidenceFile,
                                                                         Authentication authentication) throws IOException {
        ApiResponse<AbsenceData> apiResponse = lectureService.applyOfficialAbsence(authentication, request, evidenceFile, lectureId);
        return ResponseEntity.ok(apiResponse);
    }

    // 공결 신청 내역 조회
    @GetMapping("/{lecture_id}/official-requests")
    public ResponseEntity<ApiResponse<List<AbsenceRequestData>>> getOfficialAbsence(@PathVariable("lecture_id")Long lectureId,
                                                                                    Authentication authentication){
        ApiResponse<List<AbsenceRequestData>> apiResponse = lectureService.getMyOfficialRequests(authentication, lectureId);
        return ResponseEntity.ok(apiResponse);
    }

    // 공결 신청 내역 상세 조회
    @GetMapping("/{lecture_id}/official-requests/{requestId}")
    public ResponseEntity<ApiResponse<AbsenceDetailData>> getDetailOfficialAbsence(@PathVariable("lecture_id")Long lectureId,
                                                                                   @PathVariable("requestId")Long requestId,
                                                                                   Authentication authentication){
        ApiResponse<AbsenceDetailData> apiResponse = lectureService.getMyDetailOfficialRequests(authentication, lectureId, requestId);
        return ResponseEntity.ok(apiResponse);
    }

    // 공결 수정
    @PatchMapping("/{lecture_id}/official-requests/{requestId}/modify")
    public ResponseEntity<ApiResponse<AbsenceData>> modifyOfficialAbsence(@PathVariable("lecture_id")Long lectureId,
                                                                          @PathVariable("requestId") Long requestId,
                                                                          Authentication authentication,
                                                                          @RequestPart("request") AbsenceRequest request,
                                                                          @RequestPart("evidenceFile") MultipartFile evidenceFile) throws IOException {
        ApiResponse<AbsenceData> apiResponse = lectureService.modifyOfficialRequest(authentication, lectureId, requestId, request, evidenceFile);
        return ResponseEntity.ok(apiResponse);
    }

    // 공결 신청 취소
    @DeleteMapping("/{lecture_id}/official-requests/{requestId}/delete")
    public ResponseEntity<ActionResponse> getOfficialAbsence(@PathVariable("lecture_id")Long lectureId,
                                                             @PathVariable("requestId") Long requestId,
                                                             Authentication authentication){
        ActionResponse actionResponse = lectureService.deleteOfficialRequest(authentication, lectureId, requestId);
        return ResponseEntity.ok(actionResponse);
    }

    // 출결 이의 신청
    @PostMapping("/{lecture_id}/objection-absence")
    public ResponseEntity<ApiResponse<AbsenceData>> applyObjectionAbsence(@PathVariable("lecture_id") Long lectureId,
                                                                          @RequestPart("request") AbsenceRequest request,
                                                                          @RequestPart("evidenceFile") MultipartFile evidenceFile,
                                                                         Authentication authentication) throws IOException {
        ApiResponse<AbsenceData> apiResponse = lectureService.applyObjectionAbsence(authentication, request, evidenceFile, lectureId);
        return ResponseEntity.ok(apiResponse);
    }

    // 출결 이의 신청 내역 조회
    @GetMapping("/{lecture_id}/objection-requests")
    public ResponseEntity<ApiResponse<List<AbsenceRequestData>>> getObjectionAbsence(@PathVariable("lecture_id")Long lectureId,
                                                                                    Authentication authentication){
        ApiResponse<List<AbsenceRequestData>> apiResponse = lectureService.getMyObjectionRequests(authentication, lectureId);
        return ResponseEntity.ok(apiResponse);
    }

    // 출결 이의 신청 내역 상세 조회
    @GetMapping("/{lecture_id}/objection-requests/{requestId}")
    public ResponseEntity<ApiResponse<AbsenceDetailData>> getDetailObjectionAbsence(@PathVariable("lecture_id")Long lectureId,
                                                                                   @PathVariable("requestId")Long requestId,
                                                                                   Authentication authentication){
        ApiResponse<AbsenceDetailData> apiResponse = lectureService.getMyDetailObjectionRequests(authentication, lectureId, requestId);
        return ResponseEntity.ok(apiResponse);
    }

    // 출결 이의 신청 수정
    @PatchMapping("/{lecture_id}/objection-requests/{requestId}/modify")
    public ResponseEntity<ApiResponse<AbsenceData>> modifyObjectionAbsence(@PathVariable("lecture_id")Long lectureId,
                                                                          @PathVariable("requestId") Long requestId,
                                                                          Authentication authentication,
                                                                          @RequestPart("request") AbsenceRequest request,
                                                                          @RequestPart("evidenceFile") MultipartFile evidenceFile) throws IOException {
        ApiResponse<AbsenceData> apiResponse = lectureService.modifyObjectionRequest(authentication, lectureId, requestId, request, evidenceFile);
        return ResponseEntity.ok(apiResponse);
    }

    // 출결 이의 신청 취소
    @DeleteMapping("/{lecture_id}/objection-requests/{requestId}/delete")
    public ResponseEntity<ActionResponse> getObjectionAbsence(@PathVariable("lecture_id")Long lectureId,
                                                             @PathVariable("requestId") Long requestId,
                                                             Authentication authentication){
        ActionResponse actionResponse = lectureService.deleteObjectionRequest(authentication, lectureId, requestId);
        return ResponseEntity.ok(actionResponse);
    }

    // session 조회
    @GetMapping("/{lecture_id}/sessions")
    public ResponseEntity<ApiResponse<List<SessionData>>> getSessions(@PathVariable("lecture_id")Long lectureId,
                                                                      Authentication authentication){
        ApiResponse<List<SessionData>> apiResponse = lectureService.getLectureSessions(authentication, lectureId);
        return ResponseEntity.ok(apiResponse);
    }

    // 출결 통계 조회
    @GetMapping("/{lecture_id}/stats")
    public ResponseEntity<ApiResponse<StatsData>> getStats(@PathVariable("lecture_id")Long lectureId,
                                                           Authentication authentication){
        ApiResponse<StatsData> apiResponse = lectureService.getStats(authentication, lectureId);
        return ResponseEntity.ok(apiResponse);
    }

    // 시간표 조회
    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<LectureTimeTable>>> getTimeTable(Authentication authentication, @RequestParam Long year, @RequestParam String semester){

            ApiResponse<List<LectureTimeTable>> apiResponse = lectureService.getLectureTimeTable(authentication, year, semester);
            return ResponseEntity.ok(apiResponse);

    }


}
