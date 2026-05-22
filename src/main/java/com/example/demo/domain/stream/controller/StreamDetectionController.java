package com.example.demo.domain.stream.controller;

import com.example.demo.domain.stream.dto.StreamDetectionData;
import com.example.demo.domain.stream.dto.StreamDetectionRequest;
import com.example.demo.domain.stream.service.StreamDetectionService;
import com.example.demo.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/device/stream")
@RequiredArgsConstructor
public class StreamDetectionController {

    private final StreamDetectionService streamDetectionService;

    @PostMapping("/detections")
    public ResponseEntity<ApiResponse<StreamDetectionData>> saveDetection(
            Authentication authentication,
            @Valid @RequestBody StreamDetectionRequest request
    ) {
        ApiResponse<StreamDetectionData> response =
                streamDetectionService.saveDetection(authentication, request);

        return ResponseEntity.status(response.getStatus()).body(response);
    }
}