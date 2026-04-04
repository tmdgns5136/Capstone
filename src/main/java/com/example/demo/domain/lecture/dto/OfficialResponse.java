package com.example.demo.domain.lecture.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class OfficialResponse {
    private Integer status;
    private Boolean success;
    private String message;
    private OfficialData data;
    private String redirectUrl;

    @Data
    @Builder
    public static class OfficialData{
        private Long requestId;
        private String status;
    }
}
