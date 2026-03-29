package com.example.demo.dto.user;

import com.example.demo.entity.enumerate.RoleType;
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
