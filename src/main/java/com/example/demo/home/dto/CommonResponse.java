package com.example.demo.home.dto;

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
