package com.example.demo.dto.home;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CommonResponse {
    private Integer status;
    private Boolean success;
    private String message;
    private String redirectUrl;
}
