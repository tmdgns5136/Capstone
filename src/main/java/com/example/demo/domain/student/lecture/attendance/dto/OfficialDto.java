<<<<<<<< HEAD:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/dto/OfficialDto.java
package com.example.demo.domain.student.lecture.attendance.dto.dto;
========
package com.example.demo.domain.student.lecture.attendance.dto;
>>>>>>>> 1f0593f0bc29e97bf38ba7ff55195798cb7d03e4:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/OfficialDto.java

import com.example.demo.domain.enumerate.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OfficialDto {
    private Long officialId;
    private String officialTitle;
    private String officialReason;
    private String evidencePath;
    private Status status;
    private String rejectedReason;
    private Long sessionId;
    private LocalDateTime officialCreated;
}
