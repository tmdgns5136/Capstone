package com.example.demo.domain.stream.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class YoloWorkerProcessService {

    private final Map<String, Process> runningWorkers = new ConcurrentHashMap<>();

    @Value("${stream.yolo.worker.enabled:false}")
    private boolean workerEnabled;

    @Value("${stream.yolo.worker.command:python}")
    private String workerCommand;

    @Value("${stream.yolo.worker.script:yolo_stream_worker.py}")
    private String workerScript;

    @Value("${stream.yolo.worker.directory:}")
    private String workerDirectory;

    public void startWorker(String deviceId) {
        if (!workerEnabled) {
            log.info("[YOLO] worker 자동 실행 비활성화: deviceId={}", deviceId);
            return;
        }

        if (runningWorkers.containsKey(deviceId)) {
            Process existing = runningWorkers.get(deviceId);

            if (existing != null && existing.isAlive()) {
                log.info("[YOLO] 이미 실행 중: deviceId={}", deviceId);
                return;
            }

            runningWorkers.remove(deviceId);
        }

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(workerCommand, workerScript);

            if (workerDirectory != null && !workerDirectory.isBlank()) {
                processBuilder.directory(new File(workerDirectory));
            }

            processBuilder.redirectOutput(ProcessBuilder.Redirect.INHERIT);
            processBuilder.redirectError(ProcessBuilder.Redirect.INHERIT);

            Process process = processBuilder.start();
            runningWorkers.put(deviceId, process);

            log.info("[YOLO] Worker 시작: deviceId={}", deviceId);
        } catch (IOException e) {
            throw new RuntimeException("[YOLO] Worker 실행 실패: " + deviceId, e);
        }
    }

    public void stopWorker(String deviceId) {
        Process process = runningWorkers.get(deviceId);

        if (process != null && process.isAlive()) {
            process.destroy();
            log.info("[YOLO] Worker 종료: deviceId={}", deviceId);
        }

        runningWorkers.remove(deviceId);
    }
}
