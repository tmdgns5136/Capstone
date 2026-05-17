<<<<<<<< HEAD:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/dto/OfficialListResponse.java
package com.example.demo.domain.student.lecture.attendance.dto.dto;
========
package com.example.demo.domain.student.lecture.attendance.dto;
>>>>>>>> 1f0593f0bc29e97bf38ba7ff55195798cb7d03e4:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/OfficialListResponse.java

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OfficialListResponse {
    private final List<OfficialItemResponse> data;
    private final long totalElements;
    private final int totalPages;

}