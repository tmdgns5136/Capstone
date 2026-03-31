package com.example.demo.home.util;

import com.example.demo.home.dto.user.ImgDto;
import com.example.demo.entity.enumerate.ImagePosition;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileUtil {
    @Value("${com.example.upload.path.profileImg}")
    private String uploadPath;

    @PostConstruct
    public void init() {
        try {
            Path root = Paths.get(uploadPath).toAbsolutePath(); // 절대 경로로 변환
            // 폴더가 없으면 상위 폴더까지 싹 다 만듭니다 (mkdir -p와 동일)
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                System.out.println("✅ 폴더가 생성되었습니다: " + uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("❌ 폴더를 생성할 수 없습니다!", e);
        }
    }

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

    public File getMultipartFileToFile(MultipartFile multipartFile) throws IOException {
        // 1. 파일명 생성
        String fileName = getFileNameWithUUID(multipartFile.getOriginalFilename());

        // 2. 경로를 절대 경로로 정규화해서 가져오기
        Path targetPath = Paths.get(uploadPath).toAbsolutePath().normalize().resolve(fileName);
        File file = targetPath.toFile();

        // 3. 디렉토리가 혹시 없으면 여기서 한 번 더 생성
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        // 4. transferTo를 쓸 때 절대 경로 파일 객체를 넘기면 중복 경로가 안 생깁니다.
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

    public ImgDto getFIleDtoFromMultipartFile(MultipartFile multipartFile, ImagePosition position) throws IOException {
        File file = getMultipartFileToFile(multipartFile);

        // 5. DTO에 담을 때도 파일의 실제 절대 경로를 가져와서 담습니다.
        return ImgDto.builder()
                .fileName(file.getName())
                .filePath(file.getAbsolutePath()) // 상대 경로가 아닌 전체 경로 저장
                .fileType(getExtension(Objects.requireNonNull(multipartFile.getOriginalFilename())))
                .fileSize(multipartFile.getSize())
                .position(position)
                .build();
    }


}
