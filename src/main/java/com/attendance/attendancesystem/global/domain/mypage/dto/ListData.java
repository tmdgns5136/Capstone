package com.example.demo.domain.mypage.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ListData{
    private String requestId;
    private String requestDate;
    private String status;
    private List<ProfileImages> profileImages;
    private String rejectReason;

    @Data
    @Builder
    public static class ProfileImages{
        private String orientation;
        private String url;
    }
}


