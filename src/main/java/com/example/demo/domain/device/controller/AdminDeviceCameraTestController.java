package com.example.demo.domain.device.controller;

import com.example.demo.domain.device.service.DeviceService;
import com.example.demo.global.response.ActionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/devices")
@RequiredArgsConstructor
public class AdminDeviceCameraTestController {

    private final DeviceService deviceService;

    @PostMapping("/{deviceId}/camera-test/start")
    public ResponseEntity<ActionResponse> startCameraTest(@PathVariable String deviceId) {
        ActionResponse response = deviceService.startCameraTest(deviceId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/{deviceId}/camera-test/stop")
    public ResponseEntity<ActionResponse> stopCameraTest(@PathVariable String deviceId) {
        ActionResponse response = deviceService.stopCameraTest(deviceId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}