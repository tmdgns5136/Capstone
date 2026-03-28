package com.example.demo.entity.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor

public enum AttendStatus {
    ATTEND("ATTEND", "출석"),
    LATENESS("LATENESS", "지각"),
    ABSENCE("ABSENCE", "결석"),
    TBD("TBD", "미정");

    private final String code;
    private final String displayName;

    private static final Map<String, AttendStatus> attendMap =
            Arrays.stream(AttendStatus.values())
                    .collect(Collectors.toMap(AttendStatus::getCode, Function.identity()));

    public static AttendStatus of(String code){
        return attendMap.getOrDefault(code, TBD);
        }
}

