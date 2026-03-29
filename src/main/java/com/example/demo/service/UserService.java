package com.example.demo.service;

import com.example.demo.dto.user.*;
import com.example.demo.entity.enumerate.ImagePosition;
import com.example.demo.entity.enumerate.RoleType;
import com.example.demo.entity.user.*;
import com.example.demo.jwt.Token;
import com.example.demo.jwt.TokenProvider;
import com.example.demo.repository.user.*;
import com.example.demo.util.FileUtil;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
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
                .studentPhoneNum(student.getStudentPhoneNum())
                .roleType(student.getRoleType())
                .imageUrls(student.getImages() != null ? student.getImages().stream()
                        .map(Image::getFilePath).collect(Collectors.toList()):null).build();
    }

    @Transactional
    public StudentDto createStudent(JoinRequest joinRequest, MultipartFile leftImage,
                                    MultipartFile centerImage, MultipartFile rightImage) throws IOException {
        if(studentRepository.existsByStudentNum(joinRequest.getUserNum())){
            throw new RuntimeException("이미 등록된 학번입니다.");
        }
        Student student = Student.builder()
                .studentNum(joinRequest.getUserNum())
                .studentName(joinRequest.getUserName())
                .studentEmail(joinRequest.getUserEmail())
                .studentPassword(passwordEncoder.encode(joinRequest.getPassword()))
                .studentPhoneNum(joinRequest.getUserPhoneNum())
                .roleType(RoleType.STUDENT).build();

        studentRepository.saveAndFlush(student);

        ImgDto leftImgDto = fileUtil.getFIleDtoFromMultipartFile(leftImage, ImagePosition.LEFT);
        ImgDto centerImgDto = fileUtil.getFIleDtoFromMultipartFile(centerImage, ImagePosition.CENTER);
        ImgDto rightImgDto = fileUtil.getFIleDtoFromMultipartFile(rightImage, ImagePosition.RIGHT);

        fileService.saveImage(leftImgDto, student.getStudentNum());
        fileService.saveImage(centerImgDto, student.getStudentNum());
        fileService.saveImage(rightImgDto, student.getStudentNum());

        Student savedStudent = studentRepository.findByStudentNum(student.getStudentNum());
        return mapToStudentDto(savedStudent);
    }

    private ProfessorDto mapToProfessorDto(Professor professor){
        return ProfessorDto.builder()
                .professorId(professor.getProfessorId())
                .professorNum(professor.getProfessorNum())
                .professorName(professor.getProfessorName())
                .professorEmail(professor.getProfessorEmail())
                .professorPhoneNum(professor.getProfessorPhoneNum())
                .roleType(professor.getRoleType()).build();
    }

    @Transactional
    public ProfessorDto createProfessor(JoinRequest joinRequest){
        if(professorRepository.existsByProfessorNum(joinRequest.getUserNum())){
            throw new RuntimeException("이미 등록된 사번입니다.");
        }
        Professor professor = Professor.builder()
                .professorNum(joinRequest.getUserNum())
                .professorName(joinRequest.getUserName())
                .professorEmail(joinRequest.getUserEmail())
                .professorPassword(passwordEncoder.encode(joinRequest.getPassword()))
                .professorPhoneNum(joinRequest.getUserPhoneNum())
                .roleType(RoleType.PROFESSOR).build();

        professorRepository.saveAndFlush(professor);
        return mapToProfessorDto(professor);
    }

    public LoginResponse login(LoginRequest loginRequest, Date accessExpiry, Date refreshExpiry){
        String roleCode = "";
        String userName = "";
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
            encodedPassword = student.getStudentPassword();
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
            encodedPassword = professor.getProfessorPassword();
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

    public void logout(String userNum){
        refreshTokenRepository.deleteByUserNum(userNum);
    }

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

        String newAccessToken = "";
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


    @Transactional
    public void edit(EditRequest editRequest){
        String userEmail = editRequest.getUserEmail();
        if(userEmail.length() == 22){
            Student student = studentRepository.findByStudentEmail(userEmail);
            if(editRequest.getNewPassword() != null){
                student.setStudentPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            if(editRequest.getPhoneNum() != null){
                student.setStudentPhoneNum(editRequest.getPhoneNum());
            }
            studentRepository.save(student);
        }
        else{
            Professor professor = professorRepository.findByProfessorEmail(userEmail);
            if(editRequest.getNewPassword() != null){
                professor.setProfessorPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            if(editRequest.getPhoneNum() != null){
                professor.setProfessorPassword(editRequest.getPhoneNum());
            }
            professorRepository.save(professor);
        }
    }

}
