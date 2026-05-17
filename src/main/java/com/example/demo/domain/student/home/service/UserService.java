package com.example.demo.domain.student.home.service;

import com.example.demo.domain.enumerate.*;
import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.master.repository.MasterRepository;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.student.home.dto.dashboard.CourseData;
import com.example.demo.domain.student.home.dto.dashboard.CourseStateData;
import com.example.demo.domain.student.home.dto.login.JoinRequest;
import com.example.demo.domain.student.home.dto.login.LoginData;
import com.example.demo.domain.student.home.dto.login.LoginRequest;
import com.example.demo.domain.student.home.dto.user.EditRequest;
import com.example.demo.domain.student.home.dto.user.ImgDto;
import com.example.demo.domain.student.home.dto.user.ProfessorDto;
import com.example.demo.domain.student.home.dto.user.StudentDto;
import com.example.demo.domain.student.home.entity.etc.RefreshToken;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.ImageRepository;
import com.example.demo.domain.student.home.repository.RefreshTokenRepository;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.home.util.FileUtil;
import com.example.demo.domain.student.lecture.entity.Enrollment;
import com.example.demo.domain.student.lecture.repository.EnrollmentRepository;
import com.example.demo.domain.student.mypage.dto.PasswordCheck;
import com.example.demo.domain.student.notification.entity.Notification;
import com.example.demo.domain.student.notification.repository.NotificationRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.jwt.Token;
import com.example.demo.global.jwt.TokenProvider;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final MasterRepository masterRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ImageRepository imageRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenProvider tokenProvider;
    private final FileService fileService;
    private final FileUtil fileUtil;
    private final NotificationRepository notificationRepository;

    private StudentDto mapToStudentDto(Student student) {
        return StudentDto.builder()
                .studentId(student.getStudentId())
                .studentName(student.getStudentName())
                .studentNum(student.getStudentNum())
                .studentEmail(student.getStudentEmail())
                .studentPhoneNum(student.getPhoneNum())
                .roleType(student.getRoleType())
                .imageUrls(student.getImages() != null ? student.getImages().stream()
                        .map(img -> "/api/mypage/image/" + Paths.get(img.getFilePath()).getFileName().toString())
                        .collect(Collectors.toList()) : null)
                .build();
    }

    @Transactional
    public ActionResponse createStudent(
            JoinRequest joinRequest,
            MultipartFile leftImage,
            MultipartFile centerImage,
            MultipartFile rightImage
    ) throws IOException {
        if (studentRepository.existsByStudentNum(joinRequest.getUserNum())) {
            throw new CustomException(409, "이미 등록된 학번입니다.");
        }

        if (!fileService.checkImage(leftImage) || !fileService.checkImage(centerImage) || !fileService.checkImage(rightImage)) {
            throw new CustomException(400, "이미지가 아닙니다. 이미지를 입력해주세요.");
        }

        if (!fileService.checkExtension(leftImage) || !fileService.checkExtension(centerImage) || !fileService.checkExtension(rightImage)) {
            throw new CustomException(400, "이미지 형식이 맞지 않습니다. jpg, jpeg, png로 등록해주세요.");
        }

        Student student = Student.builder()
                .studentNum(joinRequest.getUserNum())
                .studentName(joinRequest.getUserName())
                .studentEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.STUDENT)
                .studentStatus(StudentStatus.ENROLLED)
                .build();

        studentRepository.saveAndFlush(student);

        ImgDto leftImgDto = fileUtil.getFIleDtoFromMultipartFile(leftImage, ImagePosition.LEFT, student.getStudentNum());
        ImgDto centerImgDto = fileUtil.getFIleDtoFromMultipartFile(centerImage, ImagePosition.CENTER, student.getStudentNum());
        ImgDto rightImgDto = fileUtil.getFIleDtoFromMultipartFile(rightImage, ImagePosition.RIGHT, student.getStudentNum());

        String requestId = "REQ-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5);

        fileService.saveImage(leftImgDto, student.getStudentNum(), requestId, ImageType.REQUESTED);
        fileService.saveImage(centerImgDto, student.getStudentNum(), requestId, ImageType.REQUESTED);
        fileService.saveImage(rightImgDto, student.getStudentNum(), requestId, ImageType.REQUESTED);

        Master master = masterRepository.findByMasterNum("admin");

        if (master != null) {
            Notification notification = Notification.builder()
                    .message(student.getStudentName() + " 학생의 프로필 변경 요청이 등록되었습니다.")
                    .relatedId(requestId)
                    .isRead(false)
                    .noticeType(NoticeType.PHOTO_RESULT)
                    .master(master)
                    .build();

            notificationRepository.save(notification);
        }

        return ActionResponse.success(201, "회원가입이 완료되었습니다.", "api/home/login");
    }

    private ProfessorDto mapToProfessorDto(Professor professor) {
        return ProfessorDto.builder()
                .professorId(professor.getProfessorId())
                .professorNum(professor.getProfessorNum())
                .professorName(professor.getProfessorName())
                .professorEmail(professor.getProfessorEmail())
                .professorPhoneNum(professor.getPhoneNum())
                .roleType(professor.getRoleType())
                .build();
    }

    @Transactional
    public ActionResponse createProfessor(JoinRequest joinRequest) {
        if (professorRepository.existsByProfessorNum(joinRequest.getUserNum())) {
            throw new CustomException(409, "이미 등록된 사번입니다.");
        }

        Professor professor = Professor.builder()
                .professorNum(joinRequest.getUserNum())
                .professorName(joinRequest.getUserName())
                .professorEmail(joinRequest.getUserEmail())
                .major(joinRequest.getMajor())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.PROFESSOR)
                .professorStatus(ProfessorStatus.EMPLOYED)
                .build();

        professorRepository.saveAndFlush(professor);

        return ActionResponse.success(201, "회원가입이 완료되었습니다.", "api/home/login");
    }

    @Transactional
    public ApiResponse<LoginData> login(
            LoginRequest loginRequest,
            Date accessExpiry,
            Date refreshExpiry,
            HttpServletResponse response
    ) {
        String roleCode;
        String userName = null;
        String encodedPassword;

        if ("admin".equals(loginRequest.getUserNum())) {
            Master master = masterRepository.findByMasterNum(loginRequest.getUserNum());

            if (master == null) {
                throw new CustomException(400, "관리자 계정이 존재하지 않습니다.");
            }

            roleCode = master.getRoleType().getCode();
            encodedPassword = master.getMasterPassword();

            if (!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)) {
                throw new CustomException(400, "비밀번호가 일치하지 않습니다.");
            }
        } else if (loginRequest.getUserNum().length() == 9) {
            Student student = studentRepository.findByStudentNum(loginRequest.getUserNum());

            if (student == null) {
                throw new CustomException(400, "가입되지 않은 학번입니다.");
            }

            roleCode = student.getRoleType().getCode();
            encodedPassword = student.getPassword();
            userName = student.getStudentName();

            if (!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)) {
                throw new CustomException(400, "비밀번호가 일치하지 않습니다.");
            }
        } else if (loginRequest.getUserNum().length() == 6) {
            Professor professor = professorRepository.findByProfessorNum(loginRequest.getUserNum());

            if (professor == null) {
                throw new CustomException(400, "가입되지 않은 사번입니다.");
            }

            roleCode = professor.getRoleType().getCode();
            encodedPassword = professor.getPassword();
            userName = professor.getProfessorName();

            if (!passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)) {
                throw new CustomException(400, "비밀번호가 일치하지 않습니다.");
            }
        } else {
            throw new CustomException(400, "아이디 형식이 올바르지 않습니다.");
        }

        Token accessToken = tokenProvider.createToken(loginRequest.getUserNum(), roleCode, accessExpiry);
        Token refreshToken = tokenProvider.createToken(loginRequest.getUserNum(), refreshExpiry);

        RefreshToken tokenEntity = refreshTokenRepository.findByUserNum(loginRequest.getUserNum())
                .orElse(new RefreshToken(loginRequest.getUserNum(), refreshToken.getToken()));

        tokenEntity.updateToken(refreshToken.getToken());
        refreshTokenRepository.save(tokenEntity);

        LoginData loginData = LoginData.builder()
                .role(roleCode.replace("ROLE_", ""))
                .userName(userName)
                .accessToken(accessToken.getToken())
                .build();

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.success(200, loginData, "로그인이 완료되었습니다.");
    }

    @Transactional
    public void logout(String userNum) {
        refreshTokenRepository.deleteByUserNum(userNum);
    }

    @Transactional
    public ApiResponse<LoginData> reissue(
            String refreshToken,
            Date newAccessExpiry,
            HttpServletResponse response
    ) {
        Token token = tokenProvider.convertToken(refreshToken);

        if (!token.validate()) {
            throw new CustomException(401, "리프레시 토큰 만료");
        }

        Claims claims = token.getTokenClaims();
        String userNum = claims.getSubject();

        RefreshToken savedToken = refreshTokenRepository.findByUserNum(userNum)
                .orElseThrow(() -> new CustomException(401, "로그인 세션 만료"));

        if (!savedToken.getRefreshToken().equals(refreshToken)) {
            throw new CustomException(401, "유효하지 않은 토큰 요청");
        }

        String newAccessToken;

        if (studentRepository.existsByStudentNum(userNum)) {
            newAccessToken = tokenProvider.createToken(userNum, "ROLE_STUDENT", newAccessExpiry).getToken();
        } else if (professorRepository.existsByProfessorNum(userNum)) {
            newAccessToken = tokenProvider.createToken(userNum, "ROLE_PROFESSOR", newAccessExpiry).getToken();
        } else {
            newAccessToken = tokenProvider.createToken(userNum, "ROLE_MASTER", newAccessExpiry).getToken();
        }

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        LoginData loginData = LoginData.builder()
                .accessToken(newAccessToken)
                .build();

        return ApiResponse.success(200, loginData);
    }

    @Transactional
    public void findPassword(EditRequest editRequest) {
        String userEmail = editRequest.getUserEmail();

        Student student = studentRepository.findByStudentEmail(userEmail);

        if (student != null) {
            if (editRequest.getNewPassword() != null) {
                student.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }

            studentRepository.save(student);
        } else {
            Professor professor = professorRepository.findByProfessorEmail(userEmail);

            if (professor == null) {
                throw new CustomException(404, "존재하지 않는 이메일입니다.");
            }

            if (editRequest.getNewPassword() != null) {
                professor.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }

            professorRepository.save(professor);
        }
    }

    public Boolean passwordCheck(
            PasswordCheck passwordCheck,
            Authentication authentication
    ) {
        String userNum = authentication.getName();

        Student student = studentRepository.findByStudentNum(userNum);

        if (student != null) {
            return passwordEncoder.matches(passwordCheck.getCurrentPassword(), student.getPassword());
        }

        Professor professor = professorRepository.findByProfessorNum(userNum);

        if (professor != null) {
            return passwordEncoder.matches(passwordCheck.getCurrentPassword(), professor.getPassword());
        }

        return false;
    }

    public ApiResponse<List<CourseData>> getTodayCourses(
            Authentication authentication,
            String year,
            String semester,
            String today
    ) {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) {
            throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        List<CourseData> courseData = enrollments.stream()
                .map(Enrollment::getLecture)
                .filter(lecture -> String.valueOf(lecture.getLectureYear()).equals(year))
                .filter(lecture -> isSameSemester(lecture.getLectureSemester(), semester))
                .filter(lecture -> hasLectureDay(lecture.getLectureDay(), today))
                .map(lecture -> CourseData.builder()
                        .lectureId(lecture.getLectureId())
                        .lectureName(lecture.getLectureName())
                        .startTime(lecture.getLectureStart())
                        .endTime(lecture.getLectureEnd())
                        .room(lecture.getLectureRoom())
                        .build())
                .toList();

        return ApiResponse.success(200, courseData);
    }

    public ApiResponse<List<CourseStateData>> getCourseState(
            Authentication authentication,
            String year,
            String semester,
            String today
    ) {
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        if (student == null) {
            throw new CustomException(404, "학생 정보를 찾을 수 없습니다.");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        List<CourseStateData> courseStateData = enrollments.stream()
                .map(Enrollment::getLecture)
                .filter(lecture -> String.valueOf(lecture.getLectureYear()).equals(year))
                .filter(lecture -> isSameSemester(lecture.getLectureSemester(), semester))
                .filter(lecture -> hasLectureDay(lecture.getLectureDay(), today))
                .filter(lecture ->
                        lecture.getLectureStart().compareTo(LocalTime.now().toString()) <= 0
                                && LocalTime.now().toString().compareTo(lecture.getLectureEnd()) <= 0
                )
                .map(lecture -> CourseStateData.builder()
                        .lectureId(lecture.getLectureId())
                        .lectureName(lecture.getLectureName())
                        .startTime(lecture.getLectureStart())
                        .endTime(lecture.getLectureEnd())
                        .room(lecture.getLectureRoom())
                        .attendancePercent("0%")
                        .build())
                .toList();

        return ApiResponse.success(200, courseStateData);
    }

    private boolean hasLectureDay(String savedLectureDay, String today) {
        if (savedLectureDay == null || today == null) {
            return false;
        }

        for (String day : savedLectureDay.split(",")) {
            if (day.trim().equalsIgnoreCase(today.trim())) {
                return true;
            }
        }

        return false;
    }

    private boolean isSameSemester(String savedSemester, String requestSemester) {
        return normalizeSemester(savedSemester).equals(normalizeSemester(requestSemester));
    }

    private String normalizeSemester(String semester) {
        if (semester == null) {
            return "";
        }

        String value = semester.trim();

        if (value.endsWith("학기")) {
            value = value.substring(0, value.length() - 2);
        }

        return value;
    }
}