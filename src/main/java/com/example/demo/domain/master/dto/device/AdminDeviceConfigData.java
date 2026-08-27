package com.example.demo.domain.master.dto.device;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDeviceConfigData {
    private boolean active;
    private Integer captureIntervalSec;
    private Integer heartbeatIntervalSec;
    private Integer commandPollIntervalSec;
    private Integer imageWidth;
    private Integer imageHeight;
    private Integer imageQuality;
    private Integer maxUploadSizeMb;
    private String allowedImageTypes;
    private Integer offlineStorageLimit;
    private String timezone;
}
