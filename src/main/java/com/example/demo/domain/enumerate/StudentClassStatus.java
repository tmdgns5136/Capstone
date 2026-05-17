package com.example.demo.domain.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum StudentClassStatus {
    SIT("SIT", "착석중"),
    AWAY("AWAY", "자리비움"),
    ABSENCE("ABSENCE", "결석");

    private final String code;
    private final String displayName;

    private static final Map<String, StudentClassStatus> attendMap =
            Arrays.stream(StudentClassStatus.values())
                    .collect(Collectors.toMap(StudentClassStatus::getCode, Function.identity()));

    public static StudentClassStatus of(String code) {
        return attendMap.get(code);
    }
}
