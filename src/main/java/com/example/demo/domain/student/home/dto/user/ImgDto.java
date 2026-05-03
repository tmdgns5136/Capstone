package com.example.demo.domain.student.home.dto.user;

import com.example.demo.domain.enumerate.ImagePosition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ImgDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private String rejectReason;
    private Long fileSize;
    private String requestId;
    private ImagePosition position;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
