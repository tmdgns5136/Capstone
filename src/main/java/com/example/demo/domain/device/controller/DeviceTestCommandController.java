package com.example.demo.domain.device.controller;

import com.example.demo.domain.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DeviceTestCommandController {

    private final DeviceService deviceService;

    @GetMapping("/api/device/test/cmd/start")
    public String sendStart(@RequestParam String deviceId,
                            @RequestParam Long lectureId,
                            @RequestParam String classroom) {
        deviceService.sendStartCaptureCommand(deviceId, lectureId, classroom, 60);
        return "OK";
    }
}