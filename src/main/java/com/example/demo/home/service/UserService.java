package com.example.demo.home.service;

import com.example.demo.home.dto.CommonResponse;
import com.example.demo.home.dto.login.JoinRequest;
import com.example.demo.home.dto.login.LoginRequest;
import com.example.demo.home.dto.login.LoginResponse;
import com.example.demo.home.dto.user.*;
import com.example.demo.home.entity.etc.Image;
import com.example.demo.home.entity.etc.RefreshToken;
import com.example.demo.mypage.dto.PasswordCheck;
import com.example.demo.entity.enumerate.ImagePosition;
import com.example.demo.entity.enumerate.RoleType;
import com.example.demo.home.entity.user.*;
import com.example.demo.home.user.*;
import com.example.demo.jwt.Token;
import com.example.demo.jwt.TokenProvider;
import com.example.demo.home.util.FileUtil;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
                        .map(Image::getFilePath).collect(Collectors.toList()):null).build();
    }

    // 학생 회원가입
    @Transactional
    public CommonResponse createStudent(JoinRequest joinRequest, MultipartFile leftImage,
                                        MultipartFile centerImage, MultipartFile rightImage) throws IOException {
        if(studentRepository.existsByStudentNum(joinRequest.getUserNum())){
            throw new RuntimeException("이미 등록된 학번입니다.");
        }
        if(!fileService.checkImage(leftImage) || !fileService.checkImage(centerImage) || !fileService.checkImage(rightImage)){
            CommonResponse commonResponse = CommonResponse.builder()
                    .status(400)
                    .success(false)
                    .message("이미지가 아닙니다. 이미지를 입력해주세요").build();
            return commonResponse;
        }

        if(!fileService.checkExtension(leftImage) || !fileService.checkExtension(centerImage) || !fileService.checkExtension(rightImage)){
            CommonResponse commonResponse = CommonResponse.builder()
                    .status(400)
                    .success(false)
                    .message("이미지 형식이 맞지 않습니다. jpg, jpeg, png로 등록해주세요.").build();
            return commonResponse;
        }
        Student student = Student.builder()
                .studentNum(joinRequest.getUserNum())
                .studentName(joinRequest.getUserName())
                .studentEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.STUDENT).build();

        studentRepository.saveAndFlush(student);

        ImgDto leftImgDto = fileUtil.getFIleDtoFromMultipartFile(leftImage, ImagePosition.LEFT);
        ImgDto centerImgDto = fileUtil.getFIleDtoFromMultipartFile(centerImage, ImagePosition.CENTER);
        ImgDto rightImgDto = fileUtil.getFIleDtoFromMultipartFile(rightImage, ImagePosition.RIGHT);

        String requestId = "REQ-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5);

        fileService.saveImage(leftImgDto, student.getStudentNum(), requestId);
        fileService.saveImage(centerImgDto, student.getStudentNum(), requestId);
        fileService.saveImage(rightImgDto, student.getStudentNum(), requestId);

        Student savedStudent = studentRepository.findByStudentNum(student.getStudentNum());

        CommonResponse commonResponse = CommonResponse.builder()
                .status(200)
                .success(true).build();
        return commonResponse;
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
    public ProfessorDto createProfessor(JoinRequest joinRequest){
        if(professorRepository.existsByProfessorNum(joinRequest.getUserNum())){
            throw new RuntimeException("이미 등록된 사번입니다.");
        }
        Professor professor = Professor.builder()
                .professorNum(joinRequest.getUserNum())
                .professorName(joinRequest.getUserName())
                .professorEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.PROFESSOR).build();

        professorRepository.saveAndFlush(professor);
        return mapToProfessorDto(professor);
    }

    // 로그인
    @Transactional
    public LoginResponse login(LoginRequest loginRequest, Date accessExpiry, Date refreshExpiry){
        String roleCode;
        String userName = null;
        String encodedPassword;
        if(("master").equals(loginRequest.getUserNum())){
            Master master = masterRepository.findByMasterNum(loginRequest.getUserNum());
            roleCode = master.getRoleType().getCode();
            encodedPassword = master.getMasterPassword();
            if(!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)){
                return failResponse("비밀번호가 일치하지 않습니다.");
            }
        }
        else if(loginRequest.getUserNum().length() == 9){
            Student student = studentRepository.findByStudentNum(loginRequest.getUserNum());
            if(student == null){
                return failResponse("가입되지 않은 학번입니다.");
            }
            roleCode = student.getRoleType().getCode();
            encodedPassword = student.getPassword();
            userName = student.getStudentName();
            if(!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)){
                return failResponse("비밀번호가 일치하지 않습니다.");
            }

        }

        else if(loginRequest.getUserNum().length() == 6){
            Professor professor = professorRepository.findByProfessorNum(loginRequest.getUserNum());
            if(professor == null){
                return failResponse("가입되지 않은 사번입니다.");
            }
            roleCode = professor.getRoleType().getCode();
            encodedPassword = professor.getPassword();
            userName = professor.getProfessorName();

            if(!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)){
                return failResponse("비밀번호가 일치하지 않습니다.");
            }
        }
        else {
            return failResponse("아이디 형식이 올바르지 않습니다.");
        }
        Token accessToken = tokenProvider.createToken(loginRequest.getUserNum(), roleCode, accessExpiry);
        Token refreshToken = tokenProvider.createToken(loginRequest.getUserNum(), refreshExpiry);

        RefreshToken tokenEntity = refreshTokenRepository.findByUserNum(loginRequest.getUserNum())
                .orElse(new RefreshToken(loginRequest.getUserNum(), refreshToken.getToken()));

        tokenEntity.updateToken(refreshToken.getToken());
        refreshTokenRepository.save(tokenEntity);

        if(("master").equals(loginRequest.getUserNum())){
            return LoginResponse.builder()
                    .status(200)
                    .success(true)
                    .data(LoginResponse.LoginData.builder()
                            .role(roleCode.replace("ROLE_", ""))
                            .accessToken(accessToken.getToken())
                            .build())
                    .message("로그인이 완료되었습니다.")
                    .redirectUrl("/api/home")
                    .build();
        }

        return LoginResponse.builder()
                .status(200)
                .success(true)
                .data(LoginResponse.LoginData.builder()
                        .userName(userName)
                        .role(roleCode.replace("ROLE_", ""))
                        .accessToken(accessToken.getToken())
                        .build())
                .message("로그인이 완료되었습니다.")
                .redirectUrl("/api/home")
                .build();
    }

    private LoginResponse failResponse(String message) {
        return LoginResponse.builder()
                .status(400)
                .success(false)
                .message(message)
                .build();
    }

    // 로그아웃
    @Transactional
    public void logout(String userNum){
        refreshTokenRepository.deleteByUserNum(userNum);
    }

    // 토큰 재발급
    @Transactional
    public LoginResponse reissue(String refreshToken, Date newAccessExpiry){
        Token token = tokenProvider.convertToken(refreshToken);

        if(!token.validate()){
            throw new RuntimeException("리프레시 토큰 만료");
        }

        Claims claims = token.getTokenClaims();
        String userNum = claims.getSubject();
        RefreshToken savedToken = refreshTokenRepository.findByUserNum(userNum)
                .orElseThrow(()-> new RuntimeException("로그인 정보가 없음"));

        if(!savedToken.getRefreshToken().equals(refreshToken)){
            throw new RuntimeException("유효하지 않은 토큰 요청");
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


        return LoginResponse.builder()
                .status(200)
                .success(true)
                .data(LoginResponse.LoginData.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(refreshToken)
                        .build())
                .build();
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

    // 정보 수정
    @Transactional
    public void edit(EditRequest editRequest, Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if(student != null){
            if(editRequest.getNewPassword() != null){
                student.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            if(editRequest.getPhoneNum() != null){
                student.setPhoneNum(editRequest.getPhoneNum());
            }
            studentRepository.save(student);
        }

        Professor professor = professorRepository.findByProfessorNum(userNum);
        if(professor != null){
            if(editRequest.getNewPassword() != null){
                professor.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            if(editRequest.getPhoneNum() != null){
                professor.setPhoneNum(editRequest.getPhoneNum());
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
