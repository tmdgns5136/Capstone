package com.example.demo.domain.master.dto.device;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDeviceErrorLogData {
    private Long id;
    private String errorCode;
    private String message;
    private String createdAt;
}
