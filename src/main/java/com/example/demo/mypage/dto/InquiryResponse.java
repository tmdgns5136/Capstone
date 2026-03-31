package com.example.demo.mypage.dto;

import jakarta.persistence.NamedEntityGraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InquiryResponse {
    private Integer status;
    private Boolean success;
    private InquiryData data;

    @Data
    @Builder
    public static class InquiryData{
        private String userName;
        private String userNum;
        private String major;
        private String userEmail;
        private String phoneNum;

        private String faceRegistrationsStatus;

        private List<ProfileImage> profileImages;
    }

    @Data
    @Builder
    public static class ProfileImage{
        private String orientation;
        private String url;
    }
}

