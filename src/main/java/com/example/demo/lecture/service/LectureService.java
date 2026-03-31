package com.example.demo.lecture.service;

import com.example.demo.home.entity.user.Professor;
import com.example.demo.home.entity.user.Student;
import com.example.demo.home.user.StudentRepository;
import com.example.demo.lecture.dto.LectureResponse;
import com.example.demo.lecture.entity.Enrollment;
import com.example.demo.lecture.entity.Lecture;
import com.example.demo.lecture.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LectureService {
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    public LectureResponse getMyLecture(Authentication authentication, Long year, String semester){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        List<LectureResponse.LectureData>lectureDataList = enrollments.stream()
                .map(Enrollment::getLecture)
                .filter(lecture -> lecture.getLectureYear().equals(year))
                .filter(lecture -> lecture.getLectureSemester().equals(semester))
                .map(lecture -> {
                    Professor professor = lecture.getProfessor();

                    return LectureResponse.LectureData.builder()
                            .lectureId(lecture.getLectureCode())
                            .lectureName(lecture.getLectureName())
                            .professorName(professor.getProfessorName()).build();
                }).toList();

        return LectureResponse.builder()
                .status(200)
                .success(true)
                .data(lectureDataList).build();
    }
}
