package com.example.demo.domain.student.home.dto.login;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginData{
    private String userName;
    private String role;
    private String accessToken;
}



