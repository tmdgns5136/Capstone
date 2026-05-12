package com.example.demo.domain.student.home.service;

import com.example.demo.domain.student.home.dto.user.ImgDto;
import com.example.demo.domain.enumerate.ImagePosition;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.home.entity.etc.Image;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.ImageRepository;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.home.util.FileUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FileService {
    private final StudentRepository studentRepository;
    private final ImageRepository imageRepository;
    private final FileUtil fileUtil;
    private final String uploadPath = Paths.get(System.getProperty("user.dir"), "uploads").toString();

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


    // 이미지인지  확인
    public boolean checkImage(MultipartFile multipartFile){
        String contentType = multipartFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return false;
        }
        return true;
    }

    // 확장자 확인
    public boolean checkExtension(MultipartFile multipartFile){
        String fileName = multipartFile.getOriginalFilename();
        if(fileName != null){
            String extension = fileUtil.getExtension(fileName).toLowerCase();
            List<String> allowedExtensions = List.of("jpg", "jpeg", "png");
            if(allowedExtensions.contains(extension)){
               return true;
            }
        }
        return false;
    }

    // 이미지 저장
    public ImgDto saveImage(ImgDto imgDto, String userNum, String requestId){
        Student student = studentRepository.findByStudentNum(userNum);
        Image image = Image.builder()
                .fileName(imgDto.getFileName())
                .filePath(imgDto.getFilePath())
                .fileType(imgDto.getFileType())
                .fileSize(imgDto.getFileSize())
                .status(Status.PENDING)
                .position(imgDto.getPosition())
                .requestId(requestId)
                .imageCreated(imgDto.getCreatedAt())
                .imageModified(imgDto.getModifiedAt())
                .student(student).build();

        Image savedImage = imageRepository.saveAndFlush(image);
        return mapToImageDto(savedImage);
    }

    // 증명 서류 저장
    public String saveEvidenceFile(MultipartFile multipartFile, String subDir) throws IOException {
        Path targetDir = Paths.get(uploadPath).resolve(subDir);

        // 3. 해당 폴더가 없으면 생성
        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        // 4. UUID 파일명 생성 및 저장
        String savedFileName = fileUtil.getFileNameWithUUID(multipartFile.getOriginalFilename());
        Path targetPath = targetDir.resolve(savedFileName);

        Files.copy(multipartFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return savedFileName;
    }
}
