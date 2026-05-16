package com.example.demo.domain.master.controller;

import com.example.demo.domain.device.dto.DeviceRegisterData;
import com.example.demo.domain.device.dto.DeviceRegisterRequest;
import com.example.demo.domain.master.dto.device.AdminDeviceData;
import com.example.demo.domain.master.dto.device.AdminPasswordCheckRequest;
import com.example.demo.domain.master.service.AdminDeviceService;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminDeviceController {

    private final AdminDeviceService adminDeviceService;

    @GetMapping("/devices")
    public ResponseEntity<ApiResponse<List<AdminDeviceData>>> getDevices(Authentication authentication) {
        ApiResponse<List<AdminDeviceData>> response = adminDeviceService.getDevices(authentication);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/devices")
    public ResponseEntity<ApiResponse<DeviceRegisterData>> registerDevice(Authentication authentication,
                                                                         @Valid @RequestBody DeviceRegisterRequest request) {
        ApiResponse<DeviceRegisterData> response = adminDeviceService.registerDevice(authentication, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/password-check")
    public ResponseEntity<ActionResponse> checkPassword(Authentication authentication,
                                                        @RequestBody AdminPasswordCheckRequest request) {
        ActionResponse response = adminDeviceService.checkPassword(authentication, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
