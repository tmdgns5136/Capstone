package com.example.demo.domain.home.dto.user;

import com.attendance.attendancesystem.global.domain.entity.enumerate.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ProfessorDto {
    private Long professorId;
    private String professorName;
    private String professorNum;
    private String professorEmail;
    private String professorPhoneNum;
    private String password;
    private RoleType roleType;
}
