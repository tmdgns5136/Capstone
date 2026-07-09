package com.example.demo.global.mqtt.handler;

import com.example.demo.domain.device.dto.DeviceHeartbeatRequest;
import com.example.demo.domain.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceHeartbeatMqttHandler {

    private final ObjectMapper objectMapper;
    private final DeviceService deviceService;

    @ServiceActivator(inputChannel = "heartbeatInputChannel")
    public void handle(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = (String) message.getPayload();

        if (topic == null || !topic.endsWith("/heartbeat")) {
            return;
        }

        log.info("MQTT heartbeat 수신 topic={}, payload={}", topic, payload);

        try {
            DeviceHeartbeatRequest request =
                    objectMapper.readValue(payload, DeviceHeartbeatRequest.class);

            deviceService.heartbeatFromMqtt(request);
        } catch (Exception e) {
            log.error("heartbeat 처리 실패 payload={}", payload, e);
        }
    }
}