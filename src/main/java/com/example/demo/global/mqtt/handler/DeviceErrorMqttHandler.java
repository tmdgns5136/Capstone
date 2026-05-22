package com.example.demo.global.mqtt.handler;

import com.example.demo.domain.device.dto.DeviceErrorMqttRequest;
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
public class DeviceErrorMqttHandler {

    private final ObjectMapper objectMapper;
    private final DeviceService deviceService;

    @ServiceActivator(inputChannel = "errorInputChannel")
    public void handle(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = (String) message.getPayload();

        if (topic == null || !topic.endsWith("/error")) {
            return;
        }

        log.info("MQTT error 수신 topic={}, payload={}", topic, payload);

        try {
            DeviceErrorMqttRequest request =
                    objectMapper.readValue(payload, DeviceErrorMqttRequest.class);

            deviceService.saveErrorFromMqtt(request);
        } catch (Exception e) {
            log.error("error payload 처리 실패 payload={}", payload, e);
        }
    }
}