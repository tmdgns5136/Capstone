package com.example.demo.domain.student.mypage.controller;

import com.example.demo.domain.student.home.dto.user.EditRequest;
import com.example.demo.domain.student.home.service.UserService;
import com.example.demo.domain.student.mypage.dto.InquiryData;
import com.example.demo.domain.student.mypage.dto.ListData;
import com.example.demo.domain.student.mypage.service.MyPageService;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
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
import java.util.List;

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
            Path filePath = Paths.get(uploadPath)
                    .resolve("photo")
                    .resolve(fileName)
                    .normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            }

            return ResponseEntity.notFound().build();

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<InquiryData>> getMyPage(Authentication authentication) {
        ApiResponse<InquiryData> apiResponse = myPageService.inquiry(authentication);
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/info-change")
    public ResponseEntity<ActionResponse> edit(
            @Valid @RequestBody EditRequest editRequest,
            Authentication authentication
    ) {
        myPageService.edit(editRequest, authentication);

        ActionResponse actionResponse = ActionResponse.success(
                200,
                "프로필 정보 변경이 완료되었습니다.",
                "api/mypage"
        );

        return ResponseEntity.ok(actionResponse);
    }

    @PatchMapping("/password-change")
    public ResponseEntity<ActionResponse> passwordChange(
            @Valid @RequestBody EditRequest editRequest,
            Authentication authentication
    ) {
        myPageService.edit(editRequest, authentication);

        ActionResponse actionResponse = ActionResponse.success(
                200,
                "비밀번호 변경이 완료되었습니다.",
                "api/home/login"
        );

        return ResponseEntity.ok(actionResponse);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ActionResponse> withdraw(Authentication authentication) {
        ActionResponse actionResponse = myPageService.withDraw(authentication);
        return ResponseEntity.ok(actionResponse);
    }

    @PatchMapping("/profileimg-request")
    public ResponseEntity<ActionResponse> imgRequest(
            @RequestPart MultipartFile leftImage,
            @RequestPart MultipartFile centerImage,
            @RequestPart MultipartFile rightImage,
            Authentication authentication
    ) throws IOException {
        ActionResponse actionResponse = myPageService.imgRequest(
                leftImage,
                centerImage,
                rightImage,
                authentication
        );

        return ResponseEntity.status(actionResponse.getStatus()).body(actionResponse);
    }

    @GetMapping("/profileimg-requests-list")
    public ResponseEntity<ApiResponse<List<ListData>>> requestList(Authentication authentication) {
        ApiResponse<List<ListData>> apiResponse = myPageService.getList(authentication);
        return ResponseEntity.ok(apiResponse);
    }
}