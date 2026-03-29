package com.example.demo.dto.user;

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
    private String userEmail;
    private String phoneNum;
}
