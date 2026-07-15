package com.example.demo.domain.professor.dto;

public class TodayLectureResponse {

    private final String lectureId;
    private final String lectureCode;
    private final String name;
    private final String location;
    private final String time;
    private final String status;
    private final Long students;

    private final Long lectureYear;
    private final String lectureSemester;

    public TodayLectureResponse(
            String lectureId,
            String lectureCode,
            String name,
            String location,
            String time,
            String status,
            Long students,
            Long lectureYear,
            String lectureSemester
    ) {
        this.lectureId = lectureId;
        this.lectureCode = lectureCode;
        this.name = name;
        this.location = location;
        this.time = time;
        this.status = status;
        this.students = students;
        this.lectureYear = lectureYear;
        this.lectureSemester = lectureSemester;
    }

    public String getLectureId() {
        return lectureId;
    }

    public String getLectureCode() {
        return lectureCode;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getTime() {
        return time;
    }

    public String getStatus() {
        return status;
    }

    public Long getStudents() {
        return students;
    }

    public Long getLectureYear() {
        return lectureYear;
    }

    public String getLectureSemester() {
        return lectureSemester;
    }
}