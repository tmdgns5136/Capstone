package com.attendance.attendancesystem.domain.professor.service;

import com.attendance.attendancesystem.domain.professor.dto.LoginRequest;
import com.attendance.attendancesystem.domain.professor.dto.LoginResponse;
import com.attendance.attendancesystem.domain.professor.entity.Professor;
import com.attendance.attendancesystem.domain.professor.repository.ProfessorRepository;
import com.attendance.attendancesystem.global.jwt.Token;
import com.attendance.attendancesystem.global.jwt.TokenProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final ProfessorRepository professorRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    @Transactional
    public LoginResponse login(LoginRequest loginRequest, Date accessExpiry, Date refreshExpiry) {
        String roleCode = "";
        String userName = null;
        String encodedPassword;

            Professor professor = professorRepository.findByProfessorNum(loginRequest.getUserNum());

            roleCode = "ROLE_PROFESSOR";
            encodedPassword = professor.getPassword();
            userName = professor.getName();



            Token accessToken = tokenProvider.createToken(loginRequest.getUserNum(), roleCode, accessExpiry);
            Token refreshToken = tokenProvider.createToken(loginRequest.getUserNum(), refreshExpiry);


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

}
