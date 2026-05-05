package com.example.demo.domain.master.controller;

import com.example.demo.domain.master.dto.*;
import com.example.demo.domain.master.service.MasterService;
import com.example.demo.domain.student.home.dto.login.JoinRequest;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
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

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class MasterController {
    private final MasterService masterService;

    @Value("${com.example.upload.path.profileImg}")
    private String uploadPath;

    // 강의 등록
    @PostMapping("/lectures")
    public ResponseEntity<ActionResponse> lectureRegister(Authentication authentication, @RequestBody CourseRequest courseRequest){
        ActionResponse actionResponse = masterService.registerCourse(authentication, courseRequest);
        return ResponseEntity.ok(actionResponse);
    }

    // 강의 목록 조회
    @GetMapping("/lectures/{professorNum}")
    public ResponseEntity<ApiResponse<List<CourseData>>> getLectures(Authentication authentication, @PathVariable("professorNum") String professorNum,
                                                                     @RequestParam("year")Long year, @RequestParam("semester")String semester){
        ApiResponse<List<CourseData>> apiResponses = masterService.getProfessorLecture(authentication, professorNum, year, semester);
        return ResponseEntity.ok(apiResponses);
    }

    // 강의 수정
    @PatchMapping("/lectures/{lecture_id}/edit")
    public ResponseEntity<ActionResponse> editLecture(Authentication authentication, @PathVariable("lecture_id")Long lectureId,
                                                      @RequestBody CourseRequest courseRequest){
        ActionResponse actionResponse = masterService.editCourses(authentication, lectureId, courseRequest);
        return ResponseEntity.ok(actionResponse);
    }

    // 강의 삭제
    @DeleteMapping("/lectures/{lecture_id}/delete")
    public ResponseEntity<ActionResponse> deleteLecture(Authentication authentication, @PathVariable("lecture_id")Long lectureId){
        ActionResponse actionResponse = masterService.deleteCourse(authentication, lectureId);
        return ResponseEntity.ok(actionResponse);
    }

    // 강의별 학생 추가
    @PostMapping("/lectures/{lecture_id}/add/students")
    public ResponseEntity<ActionResponse> addStudent(Authentication authentication, @PathVariable("lecture_id")Long lectureId,
                                                     @RequestBody AddRequest addRequest){
        ActionResponse actionResponse = masterService.addStudent(authentication, lectureId, addRequest);
        return ResponseEntity.ok(actionResponse);
    }

    // 강의별 학생 목록 조회
    @GetMapping("/lectures/{lecture_id}/get/students")
    public ResponseEntity<ApiResponse<Page<CourseStudent>>> getStudents(Authentication authentication, @PathVariable("lecture_id")Long lectureId,
                                                                        @PageableDefault(page = 0, size = 30, sort = "student.studentNum", direction = Sort.Direction.ASC) Pageable pageable){

        ApiResponse<Page<CourseStudent>> apiResponse = masterService.getStudents(authentication, lectureId, pageable);
        return ResponseEntity.ok(apiResponse);

    }

    // 강의별 학생 삭제
    @DeleteMapping("/lectures/{lecture_id}/students/{studentNum}/delete")
    public ResponseEntity<ActionResponse> deleteLectureStudent(Authentication authentication, @PathVariable("lecture_id")Long lectureId,
                                                               @PathVariable("studentNum")String studentNum){

        ActionResponse actionResponse = masterService.deleteStudent(authentication, lectureId, studentNum);
        return ResponseEntity.ok(actionResponse);
    }

    // 학생 정보 등록
    @PostMapping("/students/register")
    public ResponseEntity<ActionResponse> studentRegister(Authentication authentication, @RequestBody JoinRequest joinRequest){
        ActionResponse actionResponse = masterService.studentRegister(authentication, joinRequest);
        return ResponseEntity.ok(actionResponse);
    }

    // 학생 정보 조회
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<Page<UserData>>> getStudents(Authentication authentication,
                                                             @PageableDefault(page = 0, size = 30, sort = "studentNum", direction = Sort.Direction.ASC) Pageable pageable){
        ApiResponse<Page<UserData>> apiResponse = masterService.getStudentData(authentication, pageable);
        return ResponseEntity.ok(apiResponse);
    }

    // 특정 학생 정보 조회
    @GetMapping("/students/{studentNum}")
    public ResponseEntity<ApiResponse<UserData>> getDetailStudent(Authentication authentication, @PathVariable("studentNum") String studentNum){
        ApiResponse<UserData> apiResponse = masterService.getStudentDetailData(authentication, studentNum);
        return ResponseEntity.ok(apiResponse);
    }

    // 학생 정보 수정
    @PatchMapping("/students/{studentNum}/edit")
    public ResponseEntity<ActionResponse> editStudent(Authentication authentication, @PathVariable("studentNum")String studentNum,
                                                      @RequestBody UserEdit userEdit){
        ActionResponse actionResponse = masterService.editStudentData(authentication, studentNum, userEdit);
        return ResponseEntity.ok(actionResponse);
    }

    // 학생 정보 삭제
    @DeleteMapping("/students/{studentNum}/delete")
    public ResponseEntity<ActionResponse> deleteStudent(Authentication authentication, @PathVariable("studentNum")String studentNum){
        ActionResponse actionResponse = masterService.deleteStudent(authentication, studentNum);
        return ResponseEntity.ok(actionResponse);
    }

    // 교수 정보 등록
    @PostMapping("/professors/register")
    public ResponseEntity<ActionResponse> professorRegister(Authentication authentication, @RequestBody JoinRequest joinRequest){
        ActionResponse actionResponse = masterService.professorRegister(authentication, joinRequest);
        return ResponseEntity.ok(actionResponse);
    }

    // 교수 정보 조회
    @GetMapping("/professors")
    public ResponseEntity<ApiResponse<Page<UserData>>> getProfessors(Authentication authentication,
                                                                   @PageableDefault(page = 0, size = 30, sort = "professorNum", direction = Sort.Direction.ASC) Pageable pageable){
        ApiResponse<Page<UserData>> apiResponse = masterService.getProfessorData(authentication, pageable);
        return ResponseEntity.ok(apiResponse);
    }

    // 특정 교수 정보 조회
    @GetMapping("/professors/{professorNum}")
    public ResponseEntity<ApiResponse<UserData>> getDetailProfessor(Authentication authentication, @PathVariable("professorNum") String professorNum){
        ApiResponse<UserData> apiResponse = masterService.getProfessorDetailData(authentication, professorNum);
        return ResponseEntity.ok(apiResponse);
    }

    // 교수 정보 수정
    @PatchMapping("/professors/{professorNum}/edit")
    public ResponseEntity<ActionResponse> editProfessor(Authentication authentication, @PathVariable("professorNum")String professorNum,
                                                      @RequestBody UserEdit userEdit){
        ActionResponse actionResponse = masterService.editProfessorData(authentication, professorNum, userEdit);
        return ResponseEntity.ok(actionResponse);
    }

    // 교수 정보 삭제
    @DeleteMapping("/professors/{professorNum}/delete")
    public ResponseEntity<ActionResponse> deleteProfessor(Authentication authentication, @PathVariable("professorNum")String professorNum){
        ActionResponse actionResponse = masterService.deleteProfessor(authentication, professorNum);
        return ResponseEntity.ok(actionResponse);
    }

    // 사진 변경 요청 목록 조회
    @GetMapping("/photo-requests/pending")
    public ResponseEntity<ApiResponse<Page<PhotoData>>> getPhotos(Authentication authentication,
                                                     @PageableDefault(page = 0, size = 30, sort = "imageCreated", direction = Sort.Direction.ASC) Pageable pageable){
        ApiResponse<Page<PhotoData>> apiResponse = masterService.getPhotoRequest(authentication, pageable);
        return ResponseEntity.ok(apiResponse);
    }

    // 사진 변경 요청 처리 완료 조회
    @GetMapping("/photo-requests/not-pending")
    public ResponseEntity<ApiResponse<Page<PhotoComplete>>> getPhotoComplete(Authentication authentication,
                                                                             @PageableDefault(page = 0, size = 30, sort = "imageModified", direction = Sort.Direction.DESC) Pageable pageable){
        ApiResponse<Page<PhotoComplete>> apiResponse = masterService.getPhotoComplete(authentication, pageable);
        return ResponseEntity.ok(apiResponse);
    }

    // 사진 조회
    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        try {
            // 1. 파일의 실제 물리적 경로 찾기
            Path filePath = Paths.get(uploadPath).resolve("photo").resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // 2. 파일이 존재하는지 확인
            if (resource.exists() || resource.isReadable()) {
                // 3. 브라우저가 이미지로 인식하도록 헤더를 설정하여 반환
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) // 필요 시 파일 확장자에 따라 동적 처리 가능
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 사진 변경 요청 상세 조회
    @GetMapping("/photo-requests/{request_id}")
    public ResponseEntity<ApiResponse<PhotoDetailData>> getPhotoDetailData(Authentication authentication, @PathVariable("request_id")String requestId){
        ApiResponse<PhotoDetailData> apiResponse = masterService.getPhotoDetailData(authentication, requestId);
        return ResponseEntity.ok(apiResponse);
    }



    // 사진 변경 요청 승인/반려
    @PatchMapping("/photo-requests/{request_id}/approval")
    public ResponseEntity<ActionResponse> approveRequest(Authentication authentication, @PathVariable("request_id") String requestId,
                                                         @RequestBody PhotoCompleteRequest request){
        ActionResponse actionResponse = masterService.approvePhoto(authentication, requestId, request);
        return ResponseEntity.ok(actionResponse);
    }
}
