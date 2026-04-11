package com.example.demo.domain.home.dto.user;

import com.attendance.attendancesystem.global.domain.entity.enumerate.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class StudentDto {
    private Long studentId;
    private String studentNum;
    private String studentName;
    private String studentEmail;
    private String studentPhoneNum;
    private List<String> imageUrls;
    private RoleType roleType;
}
