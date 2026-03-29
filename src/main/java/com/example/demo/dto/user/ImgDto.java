package com.example.demo.dto.user;

import com.example.demo.entity.enumerate.ImagePosition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ImgDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private ImagePosition position;
}
