package com.example.demo.domain.student.lecture.controller;

import com.example.demo.domain.student.lecture.attendance.dto.AbsenceData;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceDetailData;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceRequest;
import com.example.demo.domain.student.lecture.attendance.dto.AbsenceRequestData;
import com.example.demo.domain.student.lecture.board.dto.*;
import com.example.demo.domain.student.lecture.dto.LectureData;
import com.example.demo.domain.student.lecture.dto.LectureTimeTable;
import com.example.demo.domain.student.lecture.dto.SessionData;
import com.example.demo.domain.student.lecture.dto.StatsData;
import com.example.demo.domain.student.lecture.service.LectureService;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/mylecture")
@RequiredArgsConstructor
@Tag(name = "LectureController", description = "This is an Lecture controller")
public class LectureController {

    private final LectureService lectureService;

    @Value("${com.example.upload.path.profileImg}")
    private String uploadPath;

    @Operation(summary = "내 강의 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureData>>> getMyLecture(
            @RequestParam("year") Long year,
            @RequestParam("semester") String semester,
            Authentication authentication
    ) {
        ApiResponse<List<LectureData>> apiResponse =
                lectureService.getMyLecture(authentication, year, semester);

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/image/{type}/{fileName}")
    public ResponseEntity<Resource> serveImage(
            @PathVariable("type") String type,
            @PathVariable("fileName") String fileName
    ) {
        try {
            Path filePath = Paths.get(uploadPath)
                    .resolve(type)
                    .resolve(fileName)
                    .normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);

                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }

            return ResponseEntity.notFound().build();

        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "공결 신청")
    @PostMapping("/{lecture_id}/official-absence")
    public ResponseEntity<ApiResponse<AbsenceData>> applyOfficialAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @RequestPart("request") AbsenceRequest request,
            @RequestPart("evidenceFile") MultipartFile evidenceFile,
            Authentication authentication
    ) throws IOException {
        ApiResponse<AbsenceData> apiResponse =
                lectureService.applyOfficialAbsence(authentication, request, evidenceFile, lectureId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "공결 신청 내역 조회")
    @GetMapping("/{lecture_id}/official-requests")
    public ResponseEntity<ApiResponse<List<AbsenceRequestData>>> getOfficialAbsence(
            @PathVariable("lecture_id") Long lectureId,
            Authentication authentication
    ) {
        ApiResponse<List<AbsenceRequestData>> apiResponse =
                lectureService.getMyOfficialRequests(authentication, lectureId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "공결 신청 내역 상세 조회")
    @GetMapping("/{lecture_id}/official-requests/{requestId}")
    public ResponseEntity<ApiResponse<AbsenceDetailData>> getDetailOfficialAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication
    ) {
        ApiResponse<AbsenceDetailData> apiResponse =
                lectureService.getMyDetailOfficialRequests(authentication, lectureId, requestId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "공결 수정")
    @PatchMapping("/{lecture_id}/official-requests/{requestId}/modify")
    public ResponseEntity<ApiResponse<AbsenceData>> modifyOfficialAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication,
            @RequestPart("request") AbsenceRequest request,
            @RequestPart("evidenceFile") MultipartFile evidenceFile
    ) throws IOException {
        ApiResponse<AbsenceData> apiResponse =
                lectureService.modifyOfficialRequest(authentication, lectureId, requestId, request, evidenceFile);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "공결 신청 취소")
    @DeleteMapping("/{lecture_id}/official-requests/{requestId}/delete")
    public ResponseEntity<ActionResponse> deleteOfficialAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication
    ) {
        ActionResponse actionResponse =
                lectureService.deleteOfficialRequest(authentication, lectureId, requestId);

        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "출결 이의 신청")
    @PostMapping("/{lecture_id}/objection-absence")
    public ResponseEntity<ApiResponse<AbsenceData>> applyObjectionAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @RequestPart("request") AbsenceRequest request,
            @RequestPart("evidenceFile") MultipartFile evidenceFile,
            Authentication authentication
    ) throws IOException {
        ApiResponse<AbsenceData> apiResponse =
                lectureService.applyObjectionAbsence(authentication, request, evidenceFile, lectureId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "출결 이의 신청 내역 조회")
    @GetMapping("/{lecture_id}/objection-requests")
    public ResponseEntity<ApiResponse<List<AbsenceRequestData>>> getObjectionAbsence(
            @PathVariable("lecture_id") Long lectureId,
            Authentication authentication
    ) {
        ApiResponse<List<AbsenceRequestData>> apiResponse =
                lectureService.getMyObjectionRequests(authentication, lectureId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "출결 이의 신청 내역 상세 조회")
    @GetMapping("/{lecture_id}/objection-requests/{requestId}")
    public ResponseEntity<ApiResponse<AbsenceDetailData>> getDetailObjectionAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication
    ) {
        ApiResponse<AbsenceDetailData> apiResponse =
                lectureService.getMyDetailObjectionRequests(authentication, lectureId, requestId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "출결 이의 신청 수정")
    @PatchMapping("/{lecture_id}/objection-requests/{requestId}/modify")
    public ResponseEntity<ApiResponse<AbsenceData>> modifyObjectionAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication,
            @RequestPart("request") AbsenceRequest request,
            @RequestPart("evidenceFile") MultipartFile evidenceFile
    ) throws IOException {
        ApiResponse<AbsenceData> apiResponse =
                lectureService.modifyObjectionRequest(authentication, lectureId, requestId, request, evidenceFile);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "출결 이의 신청 취소")
    @DeleteMapping("/{lecture_id}/objection-requests/{requestId}/delete")
    public ResponseEntity<ActionResponse> deleteObjectionAbsence(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication
    ) {
        ActionResponse actionResponse =
                lectureService.deleteObjectionRequest(authentication, lectureId, requestId);

        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "session 조회")
    @GetMapping("/{lecture_id}/sessions")
    public ResponseEntity<ApiResponse<List<SessionData>>> getSessions(
            @PathVariable("lecture_id") Long lectureId,
            Authentication authentication
    ) {
        ApiResponse<List<SessionData>> apiResponse =
                lectureService.getLectureSessions(authentication, lectureId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "출결 통계 조회")
    @GetMapping("/{lecture_id}/stats")
    public ResponseEntity<ApiResponse<StatsData>> getStats(
            @PathVariable("lecture_id") Long lectureId,
            Authentication authentication
    ) {
        ApiResponse<StatsData> apiResponse =
                lectureService.getStats(authentication, lectureId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "시간표 조회")
    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<LectureTimeTable>>> getTimeTable(
            Authentication authentication,
            @RequestParam("year") Long year,
            @RequestParam("semester") String semester
    ) {
        ApiResponse<List<LectureTimeTable>> apiResponse =
                lectureService.getLectureTimeTable(authentication, year, semester);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "강의 공지사항 조회")
    @GetMapping("/{lecture_id}/notices")
    public ResponseEntity<ApiResponse<Page<NoticeData>>> getNotices(
            Authentication authentication,
            @PathVariable("lecture_id") Long lectureId,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "noticeCreated",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        ApiResponse<Page<NoticeData>> apiResponse =
                lectureService.getNotices(authentication, lectureId, pageable);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "강의 공지사항 구체적인 내용 확인")
    @GetMapping("/{lecture_id}/notices/{notice_id}")
    public ResponseEntity<ApiResponse<NoticeDetailData>> getNoticeDetail(
            Authentication authentication,
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("notice_id") Long noticeId
    ) {
        ApiResponse<NoticeDetailData> apiResponse =
                lectureService.getNoticeDetail(authentication, lectureId, noticeId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "강의 질문 등록")
    @PostMapping("/{lecture_id}/question")
    public ResponseEntity<ApiResponse<QuestionRequestResponse>> requestQuestion(
            Authentication authentication,
            @PathVariable("lecture_id") Long lectureId,
            @RequestBody QuestionRequest questionRequest
    ) {
        ApiResponse<QuestionRequestResponse> apiResponse =
                lectureService.questionRequest(authentication, lectureId, questionRequest);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "강의 질문 게시판 내역 확인")
    @GetMapping("/{lecture_id}/questions")
    public ResponseEntity<ApiResponse<Page<QuestionData>>> getQuestions(
            Authentication authentication,
            @PathVariable("lecture_id") Long lectureId,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "questionCreated",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        ApiResponse<Page<QuestionData>> apiResponse =
                lectureService.getQuestion(authentication, lectureId, pageable);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "강의 질문 구체적인 내용 확인")
    @GetMapping("/{lecture_id}/questions/{question_id}")
    public ResponseEntity<ApiResponse<QuestionDetailData>> getQuestionDetail(
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("question_id") Long questionId,
            Authentication authentication
    ) {
        ApiResponse<QuestionDetailData> apiResponse =
                lectureService.getDetailQuestion(authentication, lectureId, questionId);

        return ResponseEntity.ok(apiResponse);
    }

    @Operation(summary = "강의 질문 삭제")
    @DeleteMapping("/{lecture_id}/questions/{question_id}/delete")
    public ResponseEntity<ActionResponse> deleteQuestions(
            Authentication authentication,
            @PathVariable("lecture_id") Long lectureId,
            @PathVariable("question_id") Long questionId
    ) {
        ActionResponse actionResponse =
                lectureService.deleteQuestion(authentication, lectureId, questionId);

        return ResponseEntity.ok(actionResponse);
    }
}