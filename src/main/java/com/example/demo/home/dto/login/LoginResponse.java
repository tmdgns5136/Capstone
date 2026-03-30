package com.example.demo.home.dto.login;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {
    private LoginData data;
    private Integer status;
    private Boolean success;
    private String message;
    private String redirectUrl;

    @Data
    @Builder
    public static class LoginData{
        private String userName;
        private String role;
        private String accessToken;
        private String refreshToken;
    }
}


