package com.example.demo.controller;

import com.example.demo.dto.home.CommonResponse;
import com.example.demo.dto.home.EditRequest;
import com.example.demo.dto.mypage.ImgRequestList;
import com.example.demo.dto.mypage.InquiryResponse;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {
    private final UserService userService;
    @GetMapping
    public ResponseEntity<InquiryResponse> getMyPage(Authentication authentication){
        InquiryResponse inquiryResponse = userService.inquiry(authentication);
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
        CommonResponse commonResponse = userService.withDraw(authentication);
        return ResponseEntity.ok(commonResponse);

    }

    @PatchMapping("/profileimg-request")
    public ResponseEntity<CommonResponse> imgRequest(@RequestPart MultipartFile leftImage,
                                                     @RequestPart MultipartFile centerImage,
                                                     @RequestPart MultipartFile rightImage, Authentication authentication) throws IOException {
        CommonResponse commonResponse = userService.imgRequest(leftImage, centerImage, rightImage, authentication);

        return ResponseEntity.status(commonResponse.getStatus()).body(commonResponse);
    }

    @GetMapping("/profileimg-requests-list")
    public ResponseEntity<ImgRequestList> requestList(Authentication authentication){
        ImgRequestList imgRequestList = userService.getList(authentication);
        return ResponseEntity.ok(imgRequestList);
    }
}
