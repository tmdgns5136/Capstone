package com.example.demo.domain.lecture.controller;

import com.example.demo.domain.lecture.dto.LectureData;
import com.example.demo.domain.lecture.dto.OfficialData;
import com.example.demo.domain.lecture.service.LectureService;
import com.example.demo.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mylecture")
@RequiredArgsConstructor
public class LectureController {
    private final LectureService lectureService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureData>>> getMyLecture(@RequestParam Long year,
                                                                  @RequestParam String semester,
                                                                  Authentication authentication){
        ApiResponse<List<LectureData>> apiResponse = lectureService.getMyLecture(authentication, year, semester);
        return ResponseEntity.ok(apiResponse);
    }
}
