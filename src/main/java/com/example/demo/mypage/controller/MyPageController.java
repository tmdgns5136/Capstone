package com.example.demo.mypage.controller;

import com.example.demo.home.dto.CommonResponse;
import com.example.demo.home.dto.user.EditRequest;
import com.example.demo.mypage.dto.ImgRequestList;
import com.example.demo.mypage.dto.InquiryResponse;
import com.example.demo.home.service.UserService;
import com.example.demo.mypage.service.MyPageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {
    private final MyPageService myPageService;
    private final UserService userService;
    @Value("${com.example.upload.path.profileImg}")
    private String uploadPath;

    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        try {
            // 1. 파일의 실제 물리적 경로 찾기
            Path filePath = Paths.get(uploadPath).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // 2. 파일이 존재하는지 확인
            if (resource.exists() || resource.isReadable()) {
                // 3. 브라우저가 이미지로 인식하도록 헤더를 설정하여 반환
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) // 필요 시 파일 확장자에 따라 동적 처리 가능
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<InquiryResponse> getMyPage(Authentication authentication){
        InquiryResponse inquiryResponse = myPageService.inquiry(authentication);
        return ResponseEntity.ok(inquiryResponse);
    }

    @PatchMapping("/info-change")
    public ResponseEntity<CommonResponse> edit(@Valid @RequestBody EditRequest editRequest, Authentication authentication){
        userService.edit(editRequest, authentication);
        CommonResponse commonResponse = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("프로필 정보 변경이 완료되었습니다.")
                .redirectUrl("api/mypage").build();
        return ResponseEntity.ok(commonResponse);
    }

    @PatchMapping("/password-change")
    public ResponseEntity<CommonResponse> passwordChange(@Valid @RequestBody EditRequest editRequest, Authentication authentication){
        userService.edit(editRequest, authentication);
        CommonResponse commonResponse = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("비밀번호 변경이 완료되었습니다.")
                .redirectUrl("api/home/login").build();
        return ResponseEntity.ok(commonResponse);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<CommonResponse> withdraw(Authentication authentication){
        CommonResponse commonResponse = myPageService.withDraw(authentication);
        return ResponseEntity.ok(commonResponse);

    }

    @PatchMapping("/profileimg-request")
    public ResponseEntity<CommonResponse> imgRequest(@RequestPart MultipartFile leftImage,
                                                     @RequestPart MultipartFile centerImage,
                                                     @RequestPart MultipartFile rightImage, Authentication authentication) throws IOException {
        CommonResponse commonResponse = myPageService.imgRequest(leftImage, centerImage, rightImage, authentication);

        return ResponseEntity.status(commonResponse.getStatus()).body(commonResponse);
    }

    @GetMapping("/profileimg-requests-list")
    public ResponseEntity<ImgRequestList> requestList(Authentication authentication){
        ImgRequestList imgRequestList = myPageService.getList(authentication);
        return ResponseEntity.ok(imgRequestList);
    }
}
