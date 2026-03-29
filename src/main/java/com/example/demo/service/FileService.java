package com.example.demo.service;

import com.example.demo.dto.user.ImgDto;
import com.example.demo.entity.enumerate.ImagePosition;
import com.example.demo.entity.enumerate.Status;
import com.example.demo.entity.user.Image;
import com.example.demo.entity.user.Student;
import com.example.demo.repository.user.ImageRepository;
import com.example.demo.repository.user.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class FileService {
    private final StudentRepository studentRepository;
    private final ImageRepository imageRepository;

    private ImgDto mapToImageDto(Image image){
        return ImgDto.builder()
                .id(image.getImageId())
                .fileName(image.getFileName())
                .filePath(image.getFilePath())
                .fileType(image.getFileType())
                .fileSize(image.getFileSize()).build();
    }

    public ImgDto getFileById(Long fileId){
        return imageRepository.findById(fileId)
                .map(this::mapToImageDto).orElse(null);
    }

    public ImgDto getFileByFilePath(String filePath){
        return imageRepository.findByFilePath(filePath).map(this::mapToImageDto).orElse(null);
    }

    public void deleteFile(Long fileId){
        imageRepository.deleteById(fileId);
    }

    public ImgDto getFileByPosition(String userNum, ImagePosition position) {
        Student student = studentRepository.findByStudentNum(userNum);
        return imageRepository.findByStudentAndPosition(student, position)
                .map(this::mapToImageDto)
                .orElse(null);
    }

    public ImgDto saveImage(ImgDto imgDto, String userNum){
        Student student = studentRepository.findByStudentNum(userNum);
        Image image = Image.builder()
                .fileName(imgDto.getFileName())
                .filePath(imgDto.getFilePath())
                .fileType(imgDto.getFileType())
                .fileSize(imgDto.getFileSize())
                .status(Status.PENDING)
                .position(imgDto.getPosition())
                .student(student).build();

        Image savedImage = imageRepository.saveAndFlush(image);
        return mapToImageDto(savedImage);
    }
}
