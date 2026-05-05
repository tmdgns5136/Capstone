package com.example.demo.domain.master.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PhotoDetailData {
    private String requestId;
    private Long studentId;
    private String studentNum;
    private String studentName;
    private String requestDate;
    private String status;
    private List<Photo> currentPhotos;
    private List<Photo> requestedPhotos;

    @Data
    @Builder
    public static class Photo{
        private String orientation;
        private String url;
    }
}
