<<<<<<<< HEAD:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/dto/ObjectionListResponse.java
package com.example.demo.domain.student.lecture.attendance.dto.dto;
========
package com.example.demo.domain.student.lecture.attendance.dto;
>>>>>>>> 1f0593f0bc29e97bf38ba7ff55195798cb7d03e4:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/ObjectionListResponse.java

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ObjectionListResponse {
    private final List<ObjectionItemResponse> data;
    private final long totalElements;
    private final int totalPages;

}