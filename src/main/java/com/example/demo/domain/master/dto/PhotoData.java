package com.example.demo.domain.master.dto;

import com.example.demo.domain.student.mypage.dto.InquiryData;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PhotoData {
    private String requestId;
    private Long studentId;
    private String studentNum;
    private String studentName;
    private String requestDate;
    private String status;
    private List<Photo> photos;

    @Data
    @Builder
    public static class Photo{
        private String orientation;
        private String url;
    }
}
