package com.example.demo.domain.enumerate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum ImageType {
    CURRENT("CURRENT", "현재 사진"),
    REQUESTED("REQUESTED", "요청 사진"),
    REJECTED("REJECTED", "거절된 사진"),
    ARCHIVED("ARCHIVED", "과거 사진");

    private final String code;
    private final String displayName;

    private static final Map<String, ImageType> statusMap =
            Arrays.stream(ImageType.values())
                    .collect(Collectors.toMap(ImageType::getCode, Function.identity()));


    public static ImageType of(String code){
        return statusMap.getOrDefault(code, ImageType.REQUESTED);

    }
}
