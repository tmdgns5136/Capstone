package com.example.demo.domain.professor.dto;

public class ProfessorLectureResponse {

    private final Long lectureId;
    private final String name;
    private final String schedule;
    private final String room;
    private final int students;

    public ProfessorLectureResponse(Long lectureId, String name, String schedule, String room, int students) {
        this.lectureId = lectureId;
        this.name = name;
        this.schedule = schedule;
        this.room = room;
        this.students = students;
    }

    public Long getLectureId() {
        return lectureId;
    }

    public String getName() {
        return name;
    }

    public String getSchedule() {
        return schedule;
    }

    public String getRoom() {
        return room;
    }

    public int getStudents() {
        return students;
    }
}