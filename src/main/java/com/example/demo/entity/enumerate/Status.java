package com.example.demo.entity.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum Status {
    PENDING("PENDING", "대기"),
    APPROVED("APPROVED", "승인"),
    REJECTED("REJECTED", "반려");

    private final String code;
    private final String displayName;

    private static final Map<String, Status> statusMap =
            Arrays.stream(Status.values())
                    .collect(Collectors.toMap(Status::getCode, Function.identity()));

    public static Status of(String code){
        return statusMap.getOrDefault(code, PENDING);
    }
}
