package com.example.demo.mypage.controller;

import com.example.demo.home.dto.CommonResponse;
import com.example.demo.home.dto.user.EditRequest;
import com.example.demo.mypage.dto.ImgRequestList;
import com.example.demo.mypage.dto.InquiryResponse;
import com.example.demo.home.service.UserService;
import com.example.demo.mypage.service.MyPageService;
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
    private final MyPageService myPageService;
    private final UserService userService;
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
