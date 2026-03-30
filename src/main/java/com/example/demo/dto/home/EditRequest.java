package com.example.demo.dto.home;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class EditRequest {
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.")
    private String newPassword;
    @Pattern(regexp = "^010-\\d{3,4}-\\d{4}$",
            message = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)")
    private String phoneNum;
    private String userEmail;
}
