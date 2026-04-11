package com.example.demo.domain.mypage.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InquiryData{
    private String userName;
    private String userNum;
    private String major;
    private String userEmail;
    private String phoneNum;

    private String faceRegistrationsStatus;

    private List<ProfileImage> profileImages;

    @Data
    @Builder
    public static class ProfileImage{
        private String orientation;
        private String url;
    }
}
