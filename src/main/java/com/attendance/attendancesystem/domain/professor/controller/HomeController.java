package com.attendance.attendancesystem.domain.professor.controller;


import com.attendance.attendancesystem.domain.professor.dto.LoginRequest;
import com.attendance.attendancesystem.domain.professor.dto.LoginResponse;
import com.attendance.attendancesystem.domain.professor.repository.ProfessorRepository;
import com.attendance.attendancesystem.domain.professor.service.LoginService;
import com.attendance.attendancesystem.domain.professor.service.ProfessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
public class HomeController {
    private final ProfessorRepository professorRepository;
    private final LoginService loginService;


    @Value("${jwt.secret}")
    private String secretKey;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest){
        // 만료시간 1시간
        Date accessExpiry = new Date(System.currentTimeMillis() + 1000 * 12 * 120);
        Date refreshExpiry = new Date(System.currentTimeMillis() + 1000 * 60 * 60);

        LoginResponse loginResponse = loginService.login(loginRequest, accessExpiry, refreshExpiry);

        return ResponseEntity.status(loginResponse.getStatus()).body(loginResponse);
    }

}
