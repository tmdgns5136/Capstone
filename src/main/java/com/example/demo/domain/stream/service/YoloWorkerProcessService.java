package com.example.demo.domain.stream.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;
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

    @Value("${stream.yolo.worker.source-template:rtsp://127.0.0.1:8554/{deviceId}}")
    private String workerSourceTemplate;

    @Value("${stream.yolo.worker.server-base-url:http://100.68.215.22:8080}")
    private String workerServerBaseUrl;

    @Value("${stream.yolo.worker.model:yolo26n.pt}")
    private String workerModel;

    @Value("${stream.yolo.worker.device:cpu}")
    private String workerDevice;

    @Value("${stream.yolo.worker.display:false}")
    private boolean workerDisplay;

    @Value("${stream.yolo.worker.output-enabled:true}")
    private boolean workerOutputEnabled;

    @Value("${stream.yolo.worker.output-template:rtsp://127.0.0.1:8554/{deviceId}-yolo}")
    private String workerOutputTemplate;

    @Value("${stream.yolo.worker.output-fps:10}")
    private String workerOutputFps;

    @Value("${stream.yolo.worker.output-bitrate:2500k}")
    private String workerOutputBitrate;

    @Value("${stream.yolo.worker.ffmpeg-command:ffmpeg}")
    private String workerFfmpegCommand;

    public void startWorker(String deviceId, String deviceSecret) {
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

            Map<String, String> environment = processBuilder.environment();
            environment.put("DEVICE_ID", deviceId);
            environment.put("DEVICE_SECRET", deviceSecret == null ? "" : deviceSecret);
            environment.put("YOLO_SOURCE", workerSourceTemplate.replace("{deviceId}", deviceId));
            environment.put("YOLO_SERVER_BASE_URL", workerServerBaseUrl);
            environment.put("YOLO_MODEL", workerModel);
            environment.put("YOLO_DEVICE", workerDevice);
            environment.put("YOLO_DISPLAY", String.valueOf(workerDisplay));
            environment.put("YOLO_OUTPUT_ENABLED", String.valueOf(workerOutputEnabled));
            environment.put("YOLO_OUTPUT_RTSP", workerOutputTemplate.replace("{deviceId}", deviceId));
            environment.put("YOLO_OUTPUT_FPS", workerOutputFps);
            environment.put("YOLO_OUTPUT_BITRATE", workerOutputBitrate);
            environment.put("YOLO_FFMPEG_COMMAND", workerFfmpegCommand);

            processBuilder.redirectOutput(ProcessBuilder.Redirect.INHERIT);
            processBuilder.redirectError(ProcessBuilder.Redirect.INHERIT);

            Process process = processBuilder.start();
            runningWorkers.put(deviceId, process);
            process.onExit().thenRun(() -> {
                runningWorkers.remove(deviceId, process);
                log.info("[YOLO] Worker 종료 감지: deviceId={}, exitCode={}", deviceId, process.exitValue());
            });

            log.info("[YOLO] Worker 시작: deviceId={}", deviceId);
        } catch (IOException e) {
            throw new RuntimeException("[YOLO] Worker 실행 실패: " + deviceId, e);
        }
    }

    public void stopWorker(String deviceId) {
        Process process = runningWorkers.get(deviceId);

        if (process != null && process.isAlive()) {
            process.destroy();
            try {
                if (!process.waitFor(3, TimeUnit.SECONDS) && process.isAlive()) {
                    process.destroyForcibly();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
            }
            log.info("[YOLO] Worker 종료: deviceId={}", deviceId);
        }

        runningWorkers.remove(deviceId);
    }
}
