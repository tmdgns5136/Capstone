package com.example.demo.lecture.controller;

import com.example.demo.lecture.dto.LectureResponse;
import com.example.demo.lecture.service.LectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mylecture")
@RequiredArgsConstructor
public class LectureController {
    private final LectureService lectureService;

    @GetMapping
    public ResponseEntity<LectureResponse> getMyLecture(@RequestParam Long year,
                                                        @RequestParam String semester,
                                                        Authentication authentication){
        LectureResponse lectureResponse = lectureService.getMyLecture(authentication, year, semester);
        return ResponseEntity.ok(lectureResponse);
    }
}
