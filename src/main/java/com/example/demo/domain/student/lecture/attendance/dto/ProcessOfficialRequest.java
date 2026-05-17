<<<<<<<< HEAD:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/dto/ProcessOfficialRequest.java
package com.example.demo.domain.student.lecture.attendance.dto.dto;
========
package com.example.demo.domain.student.lecture.attendance.dto;
>>>>>>>> 1f0593f0bc29e97bf38ba7ff55195798cb7d03e4:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/ProcessOfficialRequest.java

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessOfficialRequest {
    private String status;
    private String rejectReason;
}