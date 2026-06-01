package com.example.demo.domain.student.home.util;

import com.example.demo.domain.student.home.dto.user.ImgDto;
import com.example.demo.domain.enumerate.ImagePosition;
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
            Path root = Paths.get(uploadPath).toAbsolutePath();

            String[] directories = {"official", "objection", "photo"};

            for (String dirName : directories) {
                Path targetPath = root.resolve(dirName);

                if (!Files.exists(targetPath)) {
                    Files.createDirectories(targetPath);
                    System.out.println("✅ 폴더 생성 완료: " + targetPath);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("❌ 폴더를 생성할 수 없습니다!", e);
        }
    }

    public String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    public String getFileName(String fileName) {
        return fileName.substring(0, fileName.lastIndexOf("."));
    }

    public String getFileNameWithUUID(String fileName) {
        return UUID.randomUUID().toString() + "_" + fileName;
    }

    public File createFile(String uploadPath, String fileName) {
        return new File(uploadPath, fileName);
    }

    public File getMultipartFileToFile(
            MultipartFile multipartFile,
            String userNum,
            ImagePosition position
    ) throws IOException {

        String ext = getExtension(
                Objects.requireNonNull(multipartFile.getOriginalFilename())
        );

        String positionName;

        switch (position) {
            case CENTER:
                positionName = "center";
                break;

            case LEFT:
                positionName = "left";
                break;

            case RIGHT:
                positionName = "right";
                break;

            default:
                positionName = position.name();
                break;
        }

        String uuid = UUID.randomUUID().toString().replace("-", "");

        String fileName =
                userNum + "_" + positionName + "_" + uuid + "." + ext;

        Path targetPath = Paths.get(uploadPath)
                .toAbsolutePath()
                .normalize()
                .resolve("photo")
                .resolve(fileName);

        File file = targetPath.toFile();

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        multipartFile.transferTo(file);

        return file;
    }

    public File getFileFromFileDomain(ImgDto imgDto) {
        return new File(imgDto.getFilePath());
    }

    public File getFileFromFilePath(String filePath) {
        return new File(filePath);
    }

    public void deleteFile(ImgDto imgDto) {
        File file = getFileFromFileDomain(imgDto);

        if (file.exists()) {
            file.delete();
        }
    }

    public void deleteFileByFilePath(String filePath) {
        File file = new File(filePath);

        if (file.exists()) {
            file.delete();
        }
    }

    public ImgDto getFIleDtoFromMultipartFile(
            MultipartFile multipartFile,
            ImagePosition position,
            String userNum
    ) throws IOException {

        File file = getMultipartFileToFile(
                multipartFile,
                userNum,
                position
        );

        return ImgDto.builder()
                .fileName(file.getName())
                .filePath(file.getAbsolutePath())
                .fileType(getExtension(
                        Objects.requireNonNull(multipartFile.getOriginalFilename())
                ))
                .fileSize(multipartFile.getSize())
                .position(position)
                .build();
    }
}