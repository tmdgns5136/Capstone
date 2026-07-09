package com.example.demo.domain.device.service;

import com.example.demo.domain.device.dto.DeviceCommandMqttRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class DeviceCommandPublisher {

    private final MessageChannel mqttOutboundChannel;
    private final ObjectMapper objectMapper;

    public void publishCommand(String topic, DeviceCommandMqttRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(request);

            Message<String> message = MessageBuilder.withPayload(payload)
                    .setHeader("mqtt_topic", topic)
                    .setHeader("mqtt_qos", 1)
                    .build();

            mqttOutboundChannel.send(message);
            System.out.println("MQTT topic = " + topic);
            System.out.println("MQTT request = " + request);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("MQTT 명령 발행 실패", e);
        }
    }
}