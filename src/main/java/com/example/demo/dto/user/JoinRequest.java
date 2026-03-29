package com.example.demo.dto.user;
import jakarta.validation.constraints.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class JoinRequest {
    @NotBlank(message = "학번(사번)은 필수 항목입니다.")
    private String userNum;

    @NotBlank(message = "이름은 필수 항목입니다.")
    private String userName;

    @NotBlank
    private String userEmail;

    @NotBlank(message = "비밀번호는 필수 항목입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.")
    private String password;

    @NotBlank
    private String userPhoneNum;
}
