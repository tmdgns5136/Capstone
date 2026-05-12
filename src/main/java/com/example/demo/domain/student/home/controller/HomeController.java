package com.example.demo.domain.student.home.controller;

import com.example.demo.domain.student.home.dto.dashboard.CourseData;
import com.example.demo.domain.student.home.dto.dashboard.CourseStateData;
import com.example.demo.domain.student.home.dto.login.LoginData;
import com.example.demo.domain.student.home.dto.user.EditRequest;
import com.example.demo.domain.student.mypage.dto.PasswordCheck;
import com.example.demo.domain.student.home.dto.login.JoinRequest;
import com.example.demo.domain.student.home.dto.login.LoginRequest;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.home.service.EmailService;
import com.example.demo.domain.student.home.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
@Tag(name = "HomeController", description = "This is an Home controller")
public class HomeController {
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;

    private final UserService userService;
    private final EmailService emailService;

    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.secret}")
    private String secretKey;

    @Operation(summary = "학생 회원 가입")
    @PostMapping("/signup/student")
    public ResponseEntity<ActionResponse> signupStudent(@Valid @RequestPart JoinRequest joinRequest,
                                                        @RequestPart("leftImage") MultipartFile leftImage,
                                                        @RequestPart("centerImage") MultipartFile centerImage,
                                                        @RequestPart("rightImage") MultipartFile rightImage) throws IOException {

        ActionResponse actionResponse = userService.createStudent(joinRequest, leftImage, centerImage, rightImage);
        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "교수 회원 가입")
    @PostMapping("/signup/professor")
    public ResponseEntity<ActionResponse> signupProfessor(@Valid @RequestBody JoinRequest joinRequest){
        ActionResponse actionResponse = userService.createProfessor(joinRequest);
        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginData>> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response){
        Date accessExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 60);
        Date refreshExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 60);

        ApiResponse<LoginData> apiResponse = userService.login(loginRequest, accessExpiry, refreshExpiry, response);

        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @Operation(summary = "토큰 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginData>> refresh(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response){
        Date accessExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 10);

        ApiResponse<LoginData> apiResponse = userService.reissue(refreshToken, accessExpiry, response);
        return ResponseEntity.ok(apiResponse);

    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ActionResponse> logout(Authentication authentication){
        String userNum = authentication.getName();
        userService.logout(userNum);

        ActionResponse actionResponse = ActionResponse.success(200, "로그아웃 되었습니다.", "api/home/login");
        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "이메일 인증 번호 전송")
    @PostMapping("/email-send")
    public ResponseEntity<ActionResponse> sendEmail(@RequestBody Map<String, String> request){
        String email = request.get("email");
        String type = "join";
        if(studentRepository.existsByStudentEmail(email)){
            throw new CustomException(409, "이미 가입된 학번입니다.");
        }

        else if(professorRepository.existsByProfessorEmail(email)){
            throw new CustomException(409, "이미 가입된 사번입니다.");
        }

        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        String verificationCode = String.valueOf(code);

        emailService.sendEmail(email, verificationCode, type);

        redisTemplate.opsForValue().set(
                "EMAIL_VERIFY:" + email,
                verificationCode, Duration.ofMinutes(3)
        );

        ActionResponse actionResponse = ActionResponse.success(200, "인증번호가 발송되었습니다.");

        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "이메일 인증번호 확인")
    @PostMapping("/email-check")
    public ResponseEntity<ActionResponse> verify(@RequestBody Map<String, String> request){
        String email = request.get("email");
        String code = request.get("code");

        String savedCode = redisTemplate.opsForValue().get("EMAIL_VERIFY:" + email);

        if(savedCode == null){
            ActionResponse actionResponse = ActionResponse.fail(400, "인증 시간이 초과되었습니다.");
            return ResponseEntity.status(actionResponse.getStatus()).body(actionResponse);
        }

        if(!savedCode.equals(code)){
            ActionResponse actionResponse = ActionResponse.fail(400, "인증 번호가 일치하지 않습니다.");
            return ResponseEntity.status(actionResponse.getStatus()).body(actionResponse);
        }

        redisTemplate.delete("EMAIL_VERIFY:" + email);

        ActionResponse actionResponse = ActionResponse.success(200, "인증이 완료되었습니다.");
        return ResponseEntity.status(actionResponse.getStatus()).body(actionResponse);
    }

    @Operation(summary = "비밀번호 찾기")
    @PostMapping("/password-email-send")
    public ResponseEntity<ActionResponse> sendPasswordEmail(@RequestBody Map<String, String> request){
        String email = request.get("email");
        String type = "password";

        if(!studentRepository.existsByStudentEmail(email) && !professorRepository.existsByProfessorEmail(email)){
            throw new CustomException(404, "등록되지 않은 이메일입니다.");
        }

        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        String verificationCode = String.valueOf(code);

        emailService.sendEmail(email, verificationCode, type);

        redisTemplate.opsForValue().set(
                "EMAIL_VERIFY:" + email,
                verificationCode, Duration.ofMinutes(3)
        );

        ActionResponse actionResponse = ActionResponse
                .success(200, "인증번호가 발송되었습니다.");

        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "비밀번호 변경")
    @PatchMapping("/password-change")
    public ResponseEntity<ActionResponse> passwordChange(@Valid @RequestBody EditRequest editRequest){
        userService.findPassword(editRequest);

        ActionResponse actionResponse = ActionResponse.success(200,
                "비밀번호가 성공적으로 변경되었습니다.",
                "/api/home/login");

        return ResponseEntity.ok(actionResponse);
    }

    @Operation(summary = "현재 비밀번호와 일치하는 지 확인")
    @PostMapping("/password-check")
    public ResponseEntity<ActionResponse> passwordChecking(@RequestBody PasswordCheck passwordCheck, Authentication authentication){
        if(userService.passwordCheck(passwordCheck, authentication)){
            ActionResponse actionResponse = ActionResponse.success(200);
            return ResponseEntity.ok(actionResponse);
        }

        else{
            throw new CustomException(401, "비밀번호가 일치하지 않습니다.");
        }
    }

    @GetMapping("/today-courses")
    public ResponseEntity<ApiResponse<List<CourseData>>> getCourses(Authentication authentication, @RequestParam("year") String year,
                                                                    @RequestParam("semester") String semester, @RequestParam("today") String today){
        ApiResponse<List<CourseData>> apiResponse = userService.getTodayCourses(authentication, year, semester, today);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/current-lecture")
    public ResponseEntity<ApiResponse<List<CourseStateData>>> getCourseState(Authentication authentication,  @RequestParam("year") String year,
                                                                             @RequestParam("semester") String semester, @RequestParam("today") String today){
        ApiResponse<List<CourseStateData>> apiResponse = userService.getCourseState(authentication, year, semester, today);
        return ResponseEntity.ok(apiResponse);
    }
}