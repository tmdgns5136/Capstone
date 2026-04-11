package com.attendance.attendancesystem.global.response;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@Builder
public class ActionResponse {

    private final Integer status;
    private final boolean success;
    private final String message;
    private final String redirectUrl;

    public static ActionResponse success(Integer status) {
        return ActionResponse.builder()
                .status(status)
                .success(true)
                .build();
    }

    public static ActionResponse success(Integer status, String message, String redirectUrl) {
        return ActionResponse.builder()
                .status(status)
                .success(true)
                .message(message)
                .redirectUrl(redirectUrl)
                .build();
    }

    public static ActionResponse success(Integer status, String message) {
        return ActionResponse.builder()
                .status(status)
                .success(true)
                .message(message)
                .build();
    }

    public static ActionResponse fail(Integer status, String message) {
        return ActionResponse.builder()
                .status(status)
                .success(false) // 🔥 수정
                .message(message)
                .build();
    }

    public static ActionResponse fail(Integer status, String message, String redirectUrl) {
        return ActionResponse.builder()
                .status(status)
                .success(false) // 🔥 수정
                .message(message)
                .redirectUrl(redirectUrl)
                .build();
    }
}