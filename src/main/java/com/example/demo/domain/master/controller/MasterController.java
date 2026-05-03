package com.example.demo.domain.master.controller;

import com.example.demo.domain.master.dto.AddRequest;
import com.example.demo.domain.master.dto.CourseData;
import com.example.demo.domain.master.dto.CourseRequest;
import com.example.demo.domain.master.dto.CourseStudent;
import com.example.demo.domain.master.service.MasterService;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class MasterController {
    private final MasterService masterService;

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
}
