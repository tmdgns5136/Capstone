package com.example.demo.domain.master.dto;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class UserData {
    private Long userId;
    private String userNum;
    private String userName;
    private String userEmail;
    private String password;
    private String phoneNum;
    private String status;
}
