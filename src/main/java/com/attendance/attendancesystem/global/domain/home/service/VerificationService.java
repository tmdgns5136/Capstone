package com.example.demo.domain.home.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final StringRedisTemplate redisTemplate; // Redis와 통신하는 도구

    public void saveVerificationCode(String email, String code){
        ValueOperations<String, String> values = redisTemplate.opsForValue();
        values.set("EMAIL_VERIFY:" + email, code, Duration.ofSeconds(180));
    }

    public String getVerificationCode(String email){
        return redisTemplate.opsForValue().get("EMAIL_VERIFY:" + email);
    }
}
