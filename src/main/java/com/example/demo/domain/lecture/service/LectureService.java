package com.example.demo.domain.lecture.service;

import com.example.demo.domain.entity.enumerate.Status;
import com.example.demo.domain.home.entity.user.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.home.repository.StudentRepository;
import com.example.demo.domain.lecture.dto.LectureResponse;
import com.example.demo.domain.lecture.dto.OfficialDto;
import com.example.demo.domain.lecture.dto.OfficialRequest;
import com.example.demo.domain.lecture.entity.attendance.Official;
import com.example.demo.domain.lecture.entity.lecture.Enrollment;
import com.example.demo.domain.lecture.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    public OfficialDto mapToOfficialDto(Official official){
        return OfficialDto.builder()
                .officialTitle(official.getOfficialTitle())
                .officialReason(official.getOfficialReason())
                .evidencePath(official.getEvidencePath())
                .rejectedReason(official.getRejectedReason())
                .objectionCreated(official.getObjectionCreated())
                .status(official.getStatus()).build();

    }

    public void createOfficialAbsence(Authentication authentication, OfficialRequest request, MultipartFile evidenceFile, String lectureId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        Official official = Official.builder()
                .officialTitle(request.getTitle())
                .officialReason(request.getReason())
                .evidencePath(request.getFilePath())
                .status(Status.PENDING)
                .student(student).build();
    }

//    public OfficialResponse applyOfficialAbsence(Authentication authentication, OfficialRequest request, MultipartFile evidenceFile, String lectureId){
//        String studentNum = authentication.getName();
//
//        OfficialResponse officialResponse = OfficialResponse.builder()
//                .status(200)
//                .success(true)
//                .message("공결 신청이 접수되었습니다. 담당 교수 확인 후 처리됩니다.")
//                .data(OfficialResponse.OfficialData.builder()
//                        .requestId()build())build()
//
//    }
}
