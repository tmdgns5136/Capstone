package com.example.demo.global.mqtt.handler;

import com.example.demo.domain.device.dto.DeviceAckMqttRequest;
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
public class DeviceAckMqttHandler {

    private final ObjectMapper objectMapper;
    private final DeviceService deviceService;

    @ServiceActivator(inputChannel = "ackInputChannel")
    public void handle(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = (String) message.getPayload();

        log.info("MQTT ack 수신 topic={}, payload={}", topic, payload);

        try {
            DeviceAckMqttRequest request =
                    objectMapper.readValue(payload, DeviceAckMqttRequest.class);

            deviceService.saveAckFromMqtt(request);
        } catch (Exception e) {
            log.error("ack payload 처리 실패 payload={}", payload, e);
        }
    }
}