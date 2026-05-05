package com.example.demo.domain.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum StudentStatus {
    ENROLLED("ENROLLED", "재학"),
    LEAVE_OF_ABSENCE("LEAVE", "휴학"),
    GRADUATED("GRADUATED", "졸업");

    private final String code;
    private final String displayName;

    private static final Map<String, StudentStatus> statusMap =
            Arrays.stream(StudentStatus.values())
                    .collect(Collectors.toMap(StudentStatus::getCode, Function.identity()));

    public static StudentStatus of(String code){
        return statusMap.get(code);
    }
}
