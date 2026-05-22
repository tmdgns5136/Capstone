package com.example.demo.domain.master.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Builder
public class PhotoCompleteRequest {
    private String approvalStatus;
    private String rejectReason;
}
