package com.example.demo.dto.home;

import com.example.demo.entity.enumerate.RoleType;
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
