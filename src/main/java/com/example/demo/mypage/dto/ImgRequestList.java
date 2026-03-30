package com.example.demo.mypage.dto;

import com.example.demo.entity.enumerate.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class ImgRequestList {
    private Integer status;
    private Boolean success;
    private List<ListData> data;

    @Data
    @Builder
    public static class ListData{
        private String requestId;
        private String requestDate;
        private String status;
        private List<ProfileImages> profileImages;
        private String rejectReason;
    }

    @Data
    @Builder
    public static class ProfileImages{
        private String orientation;
        private String url;
    }


}
