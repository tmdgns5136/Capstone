<<<<<<<< HEAD:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/dto/ObjectionItemResponse.java
package com.example.demo.domain.student.lecture.attendance.dto.dto;
========
package com.example.demo.domain.student.lecture.attendance.dto;
>>>>>>>> 1f0593f0bc29e97bf38ba7ff55195798cb7d03e4:src/main/java/com/example/demo/domain/student/lecture/attendance/dto/ObjectionItemResponse.java

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ObjectionItemResponse {

    private final Long objectionId;
    private final String studentId;
    private final String studentName;
    private final String course;
    private final String date;
    private final String reason;
    private final Long sessionId;
    private final String status;

}