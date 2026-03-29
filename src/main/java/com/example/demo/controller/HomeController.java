package com.example.demo.controller;

import com.example.demo.dto.user.*;
import com.example.demo.entity.user.Student;
import com.example.demo.repository.user.ProfessorRepository;
import com.example.demo.repository.user.StudentRepository;
import com.example.demo.service.EmailService;
import com.example.demo.service.UserService;
import com.example.demo.util.FileUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Date;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
public class HomeController {
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;

    private final UserService userService;
    private final EmailService emailService;

    private final FileUtil fileUtil;
    private final PasswordEncoder passwordEncoder;

    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.secret}")
    private String secretKey;

    @PostMapping("/signup/student")
    public ResponseEntity<CommonResponse> signupStudent(@Valid @RequestPart JoinRequest joinRequest,
                                                        @RequestPart("leftImage") MultipartFile leftImage,
                                                        @RequestPart("centerImage") MultipartFile centerImage,
                                                        @RequestPart("rightImage") MultipartFile rightImage){
       try{
            userService.createStudent(joinRequest, leftImage, centerImage, rightImage);

            CommonResponse commonResponse = CommonResponse.builder()
                    .status(200)
                    .success(true)
                    .message("회원가입이 완료되었습니다.")
                    .redirectUrl("/api/home/login").build();
            return ResponseEntity.ok(commonResponse);
        }catch (RuntimeException e){
           e.printStackTrace();
           CommonResponse commonResponse = CommonResponse.builder()
                   .status(409)
                   .success(false)
                   .message("이미 등록된 학번입니다.")
                   .build();
           return ResponseEntity.status(409).body(commonResponse);
       } catch (IOException e) {
           CommonResponse commonResponse = CommonResponse.builder()
                   .status(500)
                   .success(false)
                   .message("파일 저장 중 서버 내부 오류가 발생하였습니다.")
                   .build();
           return ResponseEntity.status(500).body(commonResponse);
       }
    }

    @PostMapping("/signup/professor")
    public ResponseEntity<CommonResponse> signupProfessor(@Valid @RequestBody JoinRequest joinRequest){
        try{
            userService.createProfessor(joinRequest);

            CommonResponse commonResponse = CommonResponse.builder()
                    .status(200)
                    .success(true)
                    .message("회원가입이 완료되었습니다.")
                    .redirectUrl("/api/home/login").build();
            return ResponseEntity.ok(commonResponse);
        }catch (RuntimeException e){
            CommonResponse commonResponse = CommonResponse.builder()
                    .status(409)
                    .success(false)
                    .message("이미 등록된 사번입니다.")
                    .build();
            return ResponseEntity.status(409).body(commonResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest){
        // 만료시간 1시간
        Date accessExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 10);
        Date refreshExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 60);

        LoginResponse loginResponse = userService.login(loginRequest, accessExpiry, refreshExpiry);

        return ResponseEntity.status(loginResponse.getStatus()).body(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody Map<String, String> body){
        String refreshToken = body.get("refreshToken");
        Date accessExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 10);

        LoginResponse response = userService.reissue(refreshToken, accessExpiry);
        return ResponseEntity.ok(response);

    }

    @PostMapping("/logout")
    public ResponseEntity<CommonResponse> logout(Authentication authentication){
        String userNum = authentication.getName();
        userService.logout(userNum);

        CommonResponse response = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("로그아웃 되었습니다.")
                .redirectUrl("api/home/login").build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/email-send")
    public ResponseEntity<CommonResponse> sendEmail(@RequestBody Map<String, String> request){
        String email = request.get("email");
        if(studentRepository.existsByStudentEmail(email)){
            CommonResponse response = CommonResponse.builder()
                    .status(409)
                    .success(false)
                    .message("이미 가입된 학번입니다.").build();
            return ResponseEntity.status(409).body(response);
        }

        else if(professorRepository.existsByProfessorEmail(email)){
            CommonResponse response = CommonResponse.builder()
                    .status(409)
                    .success(false)
                    .message("이미 가입된 사번입니다.").build();
            return ResponseEntity.status(409).body(response);
        }

        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        String verificationCode = String.valueOf(code);

        emailService.sendEmail(email, verificationCode);

        redisTemplate.opsForValue().set(
                "EMAIL_VERIFY:" + email,
                verificationCode, Duration.ofMinutes(3)
        );

        CommonResponse response = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("인증 번호가 발송되었습니다.").build();

        return ResponseEntity.ok(response);


    }

    @PostMapping("/email-check")
    public ResponseEntity<CommonResponse> verify(@RequestBody Map<String, String> request){
        String email = request.get("email");
        String code = request.get("code");

        String savedCode = redisTemplate.opsForValue().get("EMAIL_VERIFY:" + email);

        if(savedCode == null){
            CommonResponse response = CommonResponse.builder()
                    .status(400)
                    .success(false)
                    .message("인증 시간이 초과되었습니다. 새로운 인증번호를 받으세요.").build();
            return ResponseEntity.status(400).body(response);
        }

        if(!savedCode.equals(code)){
            CommonResponse response = CommonResponse.builder()
                    .status(400)
                    .success(false)
                    .message("인증 번호가 일치하지 않습니다.").build();
            return ResponseEntity.status(400).body(response);
        }

        redisTemplate.delete("EMAIL_VERIFY:" + email);

        CommonResponse response = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("인증이 완료되었습니다.").build();

        return ResponseEntity.status(200).body(response);
    }

    @PatchMapping("/password-change")
    public ResponseEntity<CommonResponse> passwordChange(@Valid @RequestBody EditRequest editRequest){
        userService.edit(editRequest);

        CommonResponse response = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("비밀번호가 성공적으로 변경되었습니다.")
                .redirectUrl("/api/home/login").build();

        return ResponseEntity.ok(response);
    }
}
