package com.example.demo.util;

import com.example.demo.dto.home.ImgDto;
import com.example.demo.entity.enumerate.ImagePosition;
import com.example.demo.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileUtil {
    @Value("${com.example.upload.path.profileImg}")
    private String uploadPath;

    // 확장자 구하기
    public String getExtension(String fileName){
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    // 파일 이름 구하기
    public String getFileName(String fileName){
        return fileName.substring(0, fileName.lastIndexOf("."));
    }

    // 파일 이름 중복 방지
    public String getFileNameWithUUID(String fileName){
        return UUID.randomUUID().toString() + "_" + fileName;
    }

    public File createFile(String uploadPath, String fileName){
        return new File(uploadPath, fileName);
    }

    public File getMultipartFileToFile(MultipartFile multipartFile)throws IOException {
        File file = new File(uploadPath, getFileNameWithUUID(multipartFile.getOriginalFilename()));
        multipartFile.transferTo(file);
        return file;
    }

    public File getFileFromFileDomain(ImgDto imgDto){
        return new File(imgDto.getFilePath());
    }

    public File getFileFromFilePath(String filePath){
        return new File(filePath);
    }

    public void deleteFile(ImgDto imgDto){
        File file = getFileFromFileDomain(imgDto);
        if(file.exists()){
            file.delete();
        }
    }

    public void deleteFileByFilePath(String filePath){
        File file = new File(filePath);
        if(file.exists()){
            file.delete();
        }
    }

    public ImgDto getFIleDtoFromMultipartFile(MultipartFile multipartFile, ImagePosition position) throws IOException{
        File file = getMultipartFileToFile(multipartFile);
        String fileName = file.getName();
        String fileType = getExtension(Objects.requireNonNull(multipartFile.getOriginalFilename()));
        Long fileSize = multipartFile.getSize();

        return ImgDto.builder()
                .fileName(fileName)
                .filePath(uploadPath + File.separator + fileName)
                .fileType(fileType)
                .fileSize(fileSize)
                .position(position)
                .build();
    }


}
