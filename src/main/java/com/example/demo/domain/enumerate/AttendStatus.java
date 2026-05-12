package com.example.demo.domain.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor

public enum AttendStatus {
    PRESENT("PRESENT", "출석"),
    LATE("LATE", "지각"),
    ABSENT("ABSENT", "결석"),
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

