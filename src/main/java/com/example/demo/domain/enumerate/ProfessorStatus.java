package com.example.demo.domain.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum ProfessorStatus {
    EMPLOYED("EMPLOYED", "재직"),
    LEAVE_OF_ABSENCE("LEAVE", "휴직"),
    RETIRED("RETIRED", "퇴직");

    private final String code;
    private final String displayName;

    private static final Map<String, ProfessorStatus> statusMap =
            Arrays.stream(ProfessorStatus.values())
                    .collect(Collectors.toMap(ProfessorStatus::getCode, Function.identity()));


    public static ProfessorStatus of(String code){
        return statusMap.get(code);

    }
}
