package com.example.demo.domain.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum SessionStatus {
    NOT_STARTED("NOT_START", "강의 시작 전"),
    IN_PROGRESS("IN_PROGRESS", "강의 중"),
    ENDED("ENDED", "강의 종료");

    private final String code;
    private final String displayName;

    private static final Map<String, SessionStatus> SesssionStatusMap =
            Arrays.stream(SessionStatus.values())
                    .collect(Collectors.toMap(SessionStatus::getCode, Function.identity()));

    public static SessionStatus of(String code){
        return SesssionStatusMap.getOrDefault(code, NOT_STARTED);
    }

}
