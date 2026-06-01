package com.example.demo.domain.master.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserEdit {
    private String userNum;
    private String userName;
    private String email;
    @Pattern(regexp = "^010-\\d{3,4}-\\d{4}$",
            message = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)")
    private String phoneNum;
    private String status;
}
