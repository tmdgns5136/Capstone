package com.example.demo.domain.lecture.service;

import com.example.demo.domain.entity.enumerate.Status;
import com.example.demo.domain.home.entity.user.Professor;
import com.example.demo.domain.home.entity.user.Student;
import com.example.demo.domain.home.repository.StudentRepository;
import com.example.demo.domain.home.service.FileService;
import com.example.demo.domain.home.util.FileUtil;
import com.example.demo.domain.lecture.dto.*;
import com.example.demo.domain.lecture.entity.attendance.Official;
import com.example.demo.domain.lecture.entity.lecture.Enrollment;
import com.example.demo.domain.lecture.entity.lecture.Lecture;
import com.example.demo.domain.lecture.entity.lecture.LectureSession;
import com.example.demo.domain.lecture.repository.EnrollmentRepository;
import com.example.demo.domain.lecture.repository.LectureRepository;
import com.example.demo.domain.lecture.repository.LectureSessionRepository;
import com.example.demo.domain.lecture.repository.OfficialRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LectureService {
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository lectureRepository;
    private final OfficialRepository officialRepository;
    private final LectureSessionRepository lectureSessionRepository;
    private final FileService fileService;
    private final FileUtil fileUtil;

    public ApiResponse<List<LectureData>> getMyLecture(Authentication authentication, Long year, String semester){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        List<LectureData>lectureDataList = enrollments.stream()
                .map(Enrollment::getLecture)
                .filter(lecture -> lecture.getLectureYear().equals(year))
                .filter(lecture -> lecture.getLectureSemester().equals(semester))
                .map(lecture -> {
                    Professor professor = lecture.getProfessor();

                    return LectureData.builder()
                            .lectureId(lecture.getLectureCode())
                            .lectureName(lecture.getLectureName())
                            .professorName(professor.getProfessorName()).build();
                }).toList();

        return ApiResponse.success(200, lectureDataList);
    }

    public OfficialDto mapToOfficialDto(Official official){
        return OfficialDto.builder()
                .officialTitle(official.getOfficialTitle())
                .officialReason(official.getOfficialReason())
                .evidencePath(official.getEvidencePath())
                .rejectedReason(official.getRejectedReason())
                .objectionCreated(official.getOfficialCreated())
                .status(official.getStatus()).build();

    }

    @Transactional
    public OfficialDto createOfficialAbsence(Authentication authentication, OfficialRequest request, MultipartFile evidenceFile, Long lectureId) throws IOException {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        LectureSession session = lectureSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new CustomException(404, "해당 수업 세션을 찾을 수 없습니다."));

        String savedPath = fileService.saveEvidenceFile(evidenceFile);
        Official official = Official.builder()
                .officialTitle(request.getTitle())
                .officialReason(request.getReason())
                .evidencePath("/uploads/official/" + savedPath)
                .status(Status.PENDING)
                .lectureSession(session)
                .student(student)
                .lecture(lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."))).build();

        Official savedOfficial = officialRepository.save(official);
        return mapToOfficialDto(savedOfficial);
    }

    public ApiResponse<OfficialData> applyOfficialAbsence(Authentication authentication, OfficialRequest request, MultipartFile evidenceFile, Long lectureId) throws IOException {
        OfficialDto officialDto = createOfficialAbsence(authentication, request, evidenceFile, lectureId);

        OfficialData officialData = OfficialData.builder().requestId(officialDto.getOfficialId())
                .status(officialDto.getStatus().getCode()).build();

        return ApiResponse.success(200, officialData, "공결 신청이 정상적으로 접수되었습니다.");
    }

    public ApiResponse<List<OfficialRequestData>> getMyOfficialRequests(Authentication authentication, Long lectureId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));

        List<Official> officialList = officialRepository.findByStudentAndLecture(student, lecture);

        List<OfficialRequestData> requestDataList = officialList.stream()
                .map(official -> OfficialRequestData.builder()
                        .requestId(official.getOfficialId())
                        .title(official.getOfficialTitle())
                        .status(official.getStatus().getCode())
                        .requestDate(official.getOfficialCreated().toLocalDate().toString()).build()).toList();

        return ApiResponse.success(200, requestDataList);

    }

    @Transactional
    public ActionResponse deleteOfficialRequest(Authentication authentication, Long lectureId, Long requestId){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "존재하지 않는 강의입니다."));
        
        Official official = officialRepository.findById(requestId).orElseThrow(() -> new CustomException(404, "해당 공결신청 내역을 찾을 수 없습니다."));

        if (!official.getStudent().getStudentNum().equals(userNum)) {
            throw new CustomException(403, "해당 신청을 삭제할 권한이 없습니다.");
        }

        if(!official.getStatus().getCode().equals("PENDING")){
            throw  new CustomException(400, "이미 처리가 완료된 신청은 취소할 수 없습니다.");
        }
        String fullPath = System.getProperty("user.dir") + official.getEvidencePath();
        fileUtil.deleteFileByFilePath(fullPath);

        officialRepository.delete(official);
        return ActionResponse.success(200, "공결 신청이 취소되었습니다.",
                "api/mylecture/" + lectureId + "/official-requests");

    }
}
