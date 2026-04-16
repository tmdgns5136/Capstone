package com.example.demo.domain.entity.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum NoticeType {
    NOTICE("NOTICE", "공지사항 관련 알림"),
    ANSWER("ANSWER", "질문 게시판 관련 알림"),
    ABSENCE_OFFICIAL("ABSENCE_OFFICIAL", "공결 신청 관련 알림"),
    ABSENCE_OBJECTION("ABSENCE_OBJECTION", "이의 신청 관련 알림"),
    PHOTO_RESULT("PHOTO_RESULT", "프로필 사진 관련 알림");

    private final String code;
    private final String displayName;

    private static final Map<String, NoticeType> noticeMap =
            Arrays.stream(NoticeType.values())
                    .collect(Collectors.toMap(NoticeType::getCode, Function.identity()));

    public static NoticeType of(String code){
        return noticeMap.get(code);
    }
}
