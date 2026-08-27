package com.example.demo.domain;

import com.example.demo.domain.enumerate.SessionStatus;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.lecture.attendance.entity.Objection;
import com.example.demo.domain.student.lecture.attendance.entity.Official;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EntityBuilderDefaultTests {

    @Test
    void buildersKeepEntityStatusDefaults() {
        assertEquals(Status.PENDING, Official.builder().build().getStatus());
        assertEquals(Status.PENDING, Objection.builder().build().getStatus());
        assertEquals(SessionStatus.NOT_STARTED, LectureSession.builder().build().getStatus());
    }
}
