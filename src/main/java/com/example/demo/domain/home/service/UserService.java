package com.example.demo.domain.home.service;

import com.example.demo.domain.home.dto.login.JoinRequest;
import com.example.demo.domain.home.dto.login.LoginData;
import com.example.demo.domain.home.dto.login.LoginRequest;
import com.example.demo.domain.home.dto.user.EditRequest;
import com.example.demo.domain.home.dto.user.ImgDto;
import com.example.demo.domain.home.dto.user.ProfessorDto;
import com.example.demo.domain.home.dto.user.StudentDto;
import com.example.demo.domain.home.entity.user.Master;
import com.example.demo.domain.home.entity.user.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.home.repository.*;
import com.example.demo.domain.home.entity.etc.RefreshToken;
import com.example.demo.domain.mypage.dto.PasswordCheck;
import com.example.demo.domain.entity.enumerate.ImagePosition;
import com.example.demo.domain.entity.enumerate.RoleType;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.jwt.Token;
import com.example.demo.global.jwt.TokenProvider;
import com.example.demo.domain.home.util.FileUtil;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class UserService {
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final MasterRepository masterRepository;

    private final ImageRepository imageRepository;
    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenProvider tokenProvider;

    private final FileService fileService;
    private final FileUtil fileUtil;

    private StudentDto mapToStudentDto(Student student){
        return StudentDto.builder()
                .studentId(student.getStudentId())
                .studentName(student.getStudentName())
                .studentNum(student.getStudentNum())
                .studentEmail(student.getStudentEmail())
                .studentPhoneNum(student.getPhoneNum())
                .roleType(student.getRoleType())
                .imageUrls(student.getImages() != null ? student.getImages().stream()
                        .map(img -> "/api/mypage/image/" + Paths.get(img.getFilePath()).getFileName().toString())
                        .collect(Collectors.toList()): null).build();
    }

    // 학생 회원가입
    @Transactional
    public ActionResponse createStudent(JoinRequest joinRequest, MultipartFile leftImage,
                                        MultipartFile centerImage, MultipartFile rightImage) throws IOException {
        if(studentRepository.existsByStudentNum(joinRequest.getUserNum())){
            throw new CustomException(409, "이미 등록된 학번입니다.");
        }
        if(!fileService.checkImage(leftImage) || !fileService.checkImage(centerImage) || !fileService.checkImage(rightImage)){
            throw new CustomException(400,"이미지가 아닙니다. 이미지를 입력해주세요.");
        }

        if(!fileService.checkExtension(leftImage) || !fileService.checkExtension(centerImage) || !fileService.checkExtension(rightImage)){
            throw new CustomException(400,"이미지 형식이 맞지 않습니다. jpg, jpeg, png로 등록해주세요.");
        }
        Student student = Student.builder()
                .studentNum(joinRequest.getUserNum())
                .studentName(joinRequest.getUserName())
                .studentEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.STUDENT).build();

        studentRepository.saveAndFlush(student);

        ImgDto leftImgDto = fileUtil.getFIleDtoFromMultipartFile(leftImage, ImagePosition.LEFT, student.getStudentNum());
        ImgDto centerImgDto = fileUtil.getFIleDtoFromMultipartFile(centerImage, ImagePosition.CENTER, student.getStudentNum());
        ImgDto rightImgDto = fileUtil.getFIleDtoFromMultipartFile(rightImage, ImagePosition.RIGHT, student.getStudentNum());

        String requestId = "REQ-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5);

        fileService.saveImage(leftImgDto, student.getStudentNum(), requestId);
        fileService.saveImage(centerImgDto, student.getStudentNum(), requestId);
        fileService.saveImage(rightImgDto, student.getStudentNum(), requestId);

        Student savedStudent = studentRepository.findByStudentNum(student.getStudentNum());

        return ActionResponse.success(201, "회원가입이 완료되었습니다.", "api/home/login");
    }

    private ProfessorDto mapToProfessorDto(Professor professor){
        return ProfessorDto.builder()
                .professorId(professor.getProfessorId())
                .professorNum(professor.getProfessorNum())
                .professorName(professor.getProfessorName())
                .professorEmail(professor.getProfessorEmail())
                .professorPhoneNum(professor.getPhoneNum())
                .roleType(professor.getRoleType()).build();
    }

    // 교수 회원가입
    @Transactional
    public ActionResponse createProfessor(JoinRequest joinRequest){
        if(professorRepository.existsByProfessorNum(joinRequest.getUserNum())){
            throw new CustomException(409, "이미 등록된 사번입니다.");
        }
        Professor professor = Professor.builder()
                .professorNum(joinRequest.getUserNum())
                .professorName(joinRequest.getUserName())
                .professorEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.PROFESSOR).build();

        professorRepository.saveAndFlush(professor);
        return ActionResponse.success(201, "회원가입이 완료되었습니다.", "api/home/login");
    }

    // 로그인
    @Transactional
    public ApiResponse<LoginData> login(LoginRequest loginRequest, Date accessExpiry, Date refreshExpiry){
        String roleCode;
        String userName = null;
        String encodedPassword;
        if(("master").equals(loginRequest.getUserNum())){
            Master master = masterRepository.findByMasterNum(loginRequest.getUserNum());
            roleCode = master.getRoleType().getCode();
            encodedPassword = master.getMasterPassword();
            if(!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)){
                throw new CustomException(400, "비밀번호가 일치하지 않습니다.");
            }
        }
        else if(loginRequest.getUserNum().length() == 9){
            Student student = studentRepository.findByStudentNum(loginRequest.getUserNum());
            if(student == null){
                throw new CustomException(400, "가입되지 않은 학번입니다.");
            }
            roleCode = student.getRoleType().getCode();
            encodedPassword = student.getPassword();
            userName = student.getStudentName();
            if(!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)){
                throw new CustomException(400, "비밀번호가 일치하지 않습니다.");
            }

        }

        else if(loginRequest.getUserNum().length() == 6){
            Professor professor = professorRepository.findByProfessorNum(loginRequest.getUserNum());
            if(professor == null){
                throw new CustomException(400, "가입되지 않은 사번입니다.");
            }
            roleCode = professor.getRoleType().getCode();
            encodedPassword = professor.getPassword();
            userName = professor.getProfessorName();

            if(!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)){
                throw new CustomException(400, "비밀번호가 일치하지 않습니다.");
            }
        }
        else {
            throw new CustomException(400, "아이디 형식이 올바르지 않습니다.");
        }
        Token accessToken = tokenProvider.createToken(loginRequest.getUserNum(), roleCode, accessExpiry);
        Token refreshToken = tokenProvider.createToken(loginRequest.getUserNum(), refreshExpiry);

        RefreshToken tokenEntity = refreshTokenRepository.findByUserNum(loginRequest.getUserNum())
                .orElse(new RefreshToken(loginRequest.getUserNum(), refreshToken.getToken()));

        tokenEntity.updateToken(refreshToken.getToken());
        refreshTokenRepository.save(tokenEntity);

        LoginData loginData = LoginData.builder()
                .role(roleCode.replace("ROLE_", ""))
                .accessToken(accessToken.getToken())
                .build();

        if(("master").equals(loginRequest.getUserNum())){
            return ApiResponse.success(200, loginData, "로그인이 완료되었습니다.");
        }

        return ApiResponse.success(200, loginData, "로그인이 완료되었습니다.");
    }


    // 로그아웃
    @Transactional
    public void logout(String userNum){
        refreshTokenRepository.deleteByUserNum(userNum);
    }

    // 토큰 재발급
    @Transactional
    public ApiResponse<LoginData> reissue(String refreshToken, Date newAccessExpiry, HttpServletResponse response){
        Token token = tokenProvider.convertToken(refreshToken);

        if(!token.validate()){
            throw new CustomException(401, "리프레시 토큰 만료");
        }

        Claims claims = token.getTokenClaims();
        String userNum = claims.getSubject();
        RefreshToken savedToken = refreshTokenRepository.findByUserNum(userNum)
                .orElseThrow(()-> new CustomException(401, "로그인 세션 만료"));

        if(!savedToken.getRefreshToken().equals(refreshToken)){
            throw new CustomException(401, "유효하지 않은 토큰 요청");
        }

        String newAccessToken;
        if(studentRepository.existsByStudentNum(userNum)){
            newAccessToken = tokenProvider.createToken(userNum, "ROLE_STUDENT", newAccessExpiry).getToken();
        }

        else if(professorRepository.existsByProfessorNum(userNum)){
            newAccessToken = tokenProvider.createToken(userNum, "ROLE_PROFESSOR", newAccessExpiry).getToken();
        }
        else{
            newAccessToken = tokenProvider.createToken(userNum, "ROLE_MASTER", newAccessExpiry).getToken();
        }

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)    // 자바스크립트가 못 건드리게 막음 (핵심 ⭐)
                .secure(true)      // HTTPS 환경에서만 전송
                .path("/")         // 모든 경로에서 쿠키 사용
                .maxAge(7 * 24 * 60 * 60) // 쿠키 유효 기간 (7일)
                .sameSite("Strict") // CSRF 공격 방지
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        LoginData loginData = LoginData.builder()
                .accessToken(newAccessToken)
                .build();


        return ApiResponse.success(200, loginData);
    }


    // 비밀번호 찾기
    @Transactional
    public void findPassword(EditRequest editRequest){
        String userEmail = editRequest.getUserEmail();
        if(userEmail.length() == 22){
            Student student = studentRepository.findByStudentEmail(userEmail);
            if(editRequest.getNewPassword() != null){
                student.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            studentRepository.save(student);
        }
        else{
            Professor professor = professorRepository.findByProfessorEmail(userEmail);
            if(editRequest.getNewPassword() != null){
                professor.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            professorRepository.save(professor);
        }
    }
    

    // 현재 비밀번호와 일치하는 지 확인
    public Boolean passwordCheck(PasswordCheck passwordCheck, Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if(student != null){
            if(passwordEncoder.matches(passwordCheck.getCurrentPassword(), student.getPassword())){
                return true;
            }
        }

        Professor professor = professorRepository.findByProfessorNum(userNum);
        if(professor != null){
            if(passwordEncoder.matches(passwordCheck.getCurrentPassword(), professor.getPassword())){
                return true;
            }
        }
        return false;
    }



}
