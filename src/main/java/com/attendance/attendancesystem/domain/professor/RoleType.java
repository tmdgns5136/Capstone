package com.attendance.attendancesystem.domain.professor;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum RoleType {
    STUDENT("ROLE_STUDENT", "학생 권한"),
    PROFESSOR("ROLE_PROFESSOR", "교수 권한"),
    MASTER("ROLE_MASTER", "관리자 권한"),
    GUEST("GUEST", "게스트 권한");

    private final String code;
    private final String displayName;

    private static final Map<String, RoleType> roleMap =
            Arrays.stream(RoleType.values())
                    .collect(Collectors.toMap(RoleType::getCode, Function.identity()));

    public static RoleType of(String code) {
        return roleMap.getOrDefault(code, GUEST);
    }
}