package com.example.demo.domain.device.controller;

import com.example.demo.domain.device.dto.*;
import com.example.demo.domain.device.service.DeviceService;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<DeviceRegisterData>> register(@Valid @RequestBody DeviceRegisterRequest request) {
        ApiResponse<DeviceRegisterData> response = deviceService.register(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<DeviceLoginData>> login(@Valid @RequestBody DeviceLoginRequest request) {
        ApiResponse<DeviceLoginData> response = deviceService.login(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ActionResponse> logout(Authentication authentication) {
        ActionResponse response = deviceService.logout(authentication);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<DeviceConfigData>> getConfig(Authentication authentication) {
        ApiResponse<DeviceConfigData> response = deviceService.getConfig(authentication);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/attendance/upload")
    public ResponseEntity<ApiResponse<DeviceUploadData>> uploadAttendance(Authentication authentication,
                                                                          @RequestParam String deviceId,
                                                                          @RequestParam String capturedAt,
                                                                          @RequestParam(required = false) String uploadRequestId,
                                                                          @RequestPart("imageFile") MultipartFile imageFile) throws IOException {
        ApiResponse<DeviceUploadData> response =
                deviceService.uploadAttendance(authentication, deviceId, capturedAt, uploadRequestId, imageFile);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/attendance/uploads/{captureId}")
    public ResponseEntity<ApiResponse<DeviceUploadResultData>> getUploadResult(Authentication authentication,
                                                                               @PathVariable Long captureId) {
        ApiResponse<DeviceUploadResultData> response = deviceService.getUploadResult(authentication, captureId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<ActionResponse> heartbeat(Authentication authentication,
                                                    @Valid @RequestBody DeviceHeartbeatRequest request) {
        ActionResponse response = deviceService.heartbeat(authentication, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/logs")
    public ResponseEntity<ActionResponse> saveLog(Authentication authentication,
                                                  @Valid @RequestBody DeviceLogRequest request) {
        ActionResponse response = deviceService.saveLog(authentication, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
