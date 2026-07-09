package com.example.demo.domain.stream.controller;

import com.example.demo.domain.stream.dto.StreamEventData;
import com.example.demo.domain.stream.dto.StreamEventRequest;
import com.example.demo.domain.stream.service.StreamEventService;
import com.example.demo.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/device/stream")
public class StreamEventController {

    private final StreamEventService streamEventService;

    public StreamEventController(StreamEventService streamEventService) {
        this.streamEventService = streamEventService;
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<StreamEventData>> saveEvent(
            Authentication authentication,
            @Valid @RequestBody StreamEventRequest request
    ) {
        ApiResponse<StreamEventData> response =
                streamEventService.saveEvent(authentication, request);

        return ResponseEntity.status(response.getStatus()).body(response);
    }
}