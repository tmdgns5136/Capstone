package com.attendance.attendancesystem.domain.professor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginRequest {
    private String userNum;
    private String password;
}