package com.example.demo.domain.master.service;

import com.example.demo.domain.enumerate.*;
import com.example.demo.domain.master.dto.*;
import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.master.repository.MasterRepository;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.student.home.dto.login.JoinRequest;
import com.example.demo.domain.student.home.dto.user.EditRequest;
import com.example.demo.domain.student.home.entity.etc.Image;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.ImageRepository;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.home.util.FileUtil;
import com.example.demo.domain.student.lecture.board.dto.NoticeData;
import com.example.demo.domain.student.lecture.board.entity.NoticeBoard;
import com.example.demo.domain.student.lecture.entity.Enrollment;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.entity.LectureSession;
import com.example.demo.domain.student.lecture.repository.EnrollmentRepository;
import com.example.demo.domain.student.lecture.repository.LectureRepository;
import com.example.demo.domain.student.lecture.repository.LectureSessionRepository;
import com.example.demo.domain.student.mypage.dto.InquiryData;
import com.example.demo.domain.student.notification.entity.Notification;
import com.example.demo.domain.student.notification.repository.NotificationRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MasterService {
    private final ProfessorRepository professorRepository;
    private final MasterRepository masterRepository;
    private final LectureRepository lectureRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageRepository imageRepository;
    private final FileUtil fileUtil;
    private final NotificationRepository notificationRepository;
    private final LectureSessionRepository lectureSessionRepository;

    // 강의 등록
    @Transactional
    public ActionResponse registerCourse(Authentication authentication, CourseRequest courseRequest){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "강의를 등록할 권한이 없습니다.");
        }

        Professor professor = professorRepository.findByProfessorNum(courseRequest.getProfessorNum());
        if (professor == null) {
            throw new CustomException(404, "해당 교수 정보를 찾을 수 없습니다.");
        }

        Lecture lecture = Lecture.builder()
                .lectureName(courseRequest.getLectureName())
                .lectureCode(courseRequest.getLectureCode())
                .professor(professor)
                .lectureStart(courseRequest.getStartTime())
                .lectureEnd(courseRequest.getEndTime())
                .lectureRoom(courseRequest.getRoom())
                .lectureYear(courseRequest.getYear())
                .lectureSemester(courseRequest.getSemester())
                .lectureDay(courseRequest.getLectureDay())
                .lectureDivision(courseRequest.getDivision()).build();

        lectureRepository.save(lecture);

        return ActionResponse.success(201, "강의가 등록되었습니다.", "/api/home");
    }

    // lectureSession 생성
    private void createLectureSessions(Lecture lecture) {
        // 시간 파싱을 위한 포매터 (HH:mm 형식 가정)
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime startTime = LocalTime.parse(lecture.getLectureStart(), timeFormatter);
        LocalTime endTime = LocalTime.parse(lecture.getLectureEnd(), timeFormatter);
        DayOfWeek targetDay = DayOfWeek.valueOf(lecture.getLectureDay().toUpperCase());

        // A. 개강일 계산: 해당 연도 3월 1일부터 시작하여 첫 번째 평일(월~금) 찾기
        LocalDate startDate = LocalDate.of(lecture.getLectureYear().intValue(), 3, 1);
        while (startDate.getDayOfWeek() == DayOfWeek.SATURDAY || startDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
            startDate = startDate.plusDays(1);
        }

        // B. 첫 번째 수업일 찾기 (개강일 이후 해당 요일인 첫 날)
        LocalDate firstClassDate = startDate;
        while (firstClassDate.getDayOfWeek() != targetDay) {
            firstClassDate = firstClassDate.plusDays(1);
        }

        long sessionCount = 1; // SESSION_NUM 관리용

        // C. 15주간 반복
        for (int week = 0; week < 16; week++) {
            LocalDate currentDay = firstClassDate.plusWeeks(week);
            LocalTime currentPeriodStart = startTime;

            // D. 시간 분할 (50분 수업, 10분 휴식 = 1시간 간격)
            // 다음 수업 시작+50분이 전체 종료시간을 넘지 않을 때까지 생성
            while (!currentPeriodStart.plusMinutes(50).isAfter(endTime)) {

                LectureSession session = LectureSession.builder()
                        .lecture(lecture)
                        .sessionNum(sessionCount++) // 세션 번호 증가
                        .scheduledAt(currentDay)
                        .sessionStart(LocalDateTime.of(currentDay, currentPeriodStart))
                        .sessionEnd(LocalDateTime.of(currentDay, currentPeriodStart.plusMinutes(50)))
                        .status(SessionStatus.NOT_STARTED)
                        .build();

                lectureSessionRepository.save(session);

                // 다음 교시 시작 (1시간 뒤)
                currentPeriodStart = currentPeriodStart.plusHours(1);
            }
        }
    }

    // 교수별 강의 목록 조회
    public ApiResponse<List<CourseData>> getProfessorLecture(Authentication authentication, String professorNum, Long year, String semester){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "강의를 조회할 권한이 없습니다.");
        }

        Professor professor = professorRepository.findByProfessorNum(professorNum);
        if (professor == null) {
            throw new CustomException(404, "해당 교수 정보를 찾을 수 없습니다.");
        }

        List<Lecture> lectures = lectureRepository.findByProfessor(professor);

        List<CourseData> courseDataList = lectures.stream()
                .filter(lecture -> lecture.getLectureYear().equals(year))
                .filter(lecture -> lecture.getLectureSemester().equals(semester))
                .map(lecture -> {
                    return CourseData.builder().lectureId(lecture.getLectureId())
                            .lectureName(lecture.getLectureName())
                            .lectureCode(lecture.getLectureCode())
                            .ProfessorName(professor.getProfessorName())
                            .startTime(lecture.getLectureStart())
                            .endTime(lecture.getLectureEnd())
                            .room(lecture.getLectureRoom())
                            .lectureDay(lecture.getLectureDay())
                            .division(lecture.getLectureDivision())
                            .studentCount(enrollmentRepository.countByLecture_LectureId(lecture.getLectureId())).build();

                }).toList();

        return ApiResponse.success(200, courseDataList);
    }

    // 강의 수정
    @Transactional
    public ActionResponse editCourses(Authentication authentication, Long lectureId, CourseRequest courseRequest){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "강의를 수정할 권한이 없습니다.");
        }

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "해당 강의를 찾을 수 없습니다."));

        if(courseRequest.getLectureName() != null){
            lecture.setLectureName(courseRequest.getLectureName());
        }
        if(courseRequest.getYear() != null){
            lecture.setLectureYear(courseRequest.getYear());
        }
        if(courseRequest.getSemester() != null){
            lecture.setLectureSemester(courseRequest.getSemester());
        }
        if(courseRequest.getDivision() != null){
            lecture.setLectureDivision(courseRequest.getDivision());
        }
        if(courseRequest.getLectureDay() != null){
            lecture.setLectureDay(courseRequest.getLectureDay());
        }
        if(courseRequest.getLectureCode() != null){
            if (!courseRequest.getLectureCode().equals(lecture.getLectureCode())) {
                if (lectureRepository.existsByLectureCode(courseRequest.getLectureCode())) {
                    throw new CustomException(409, "이미 사용 중인 강의 코드입니다.");
                }
                lecture.setLectureCode(courseRequest.getLectureCode());
            }
        }
        if(courseRequest.getProfessorNum() != null){
            Professor professor = professorRepository.findByProfessorNum(courseRequest.getProfessorNum());
            if (professor == null) {
                throw new CustomException(404, "해당 교수 정보를 찾을 수 없습니다.");
            }
            lecture.setProfessor(professor);
        }
        if(courseRequest.getStartTime() != null){
            lecture.setLectureStart(courseRequest.getStartTime());
        }
        if(courseRequest.getEndTime() != null){
            lecture.setLectureEnd(courseRequest.getEndTime());
        }
        if(courseRequest.getRoom() != null){
            lecture.setLectureRoom(courseRequest.getRoom());
        }

        lectureRepository.save(lecture);
        return ActionResponse.success(200, "강의 정보가 수정되었습니다.", "/api/admin/lectures/" + lecture.getProfessor().getProfessorNum());
    }

    // 강의 삭제
    @Transactional
    public ActionResponse deleteCourse(Authentication authentication, Long lectureId){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "강의를 삭제할 권한이 없습니다.");
        }

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "해당 강의를 찾을 수 없습니다."));

        lectureRepository.delete(lecture);

        return ActionResponse.success(200, "강의가 삭제되었습니다.", "/api/admin/lectures/" + lecture.getProfessor().getProfessorNum());
    }
    
    // 강의별 학생 추가
    @Transactional
    public ActionResponse addStudent(Authentication authentication, Long lectureId, AddRequest addRequest){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 추가할 권한이 없습니다.");
        }

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "해당 강의를 찾을 수 없습니다."));
        Student student = studentRepository.findByStudentNum(addRequest.getStudentNum());
        if(student == null){
            throw new CustomException(404, "해당 학생을 찾을 수 없습니다.");
        }
        Enrollment enrollment = Enrollment.builder()
                .lecture(lecture)
                .student(student).build();

        enrollmentRepository.save(enrollment);
        return ActionResponse.success(200, "학생이 추가되었습니다.", "/api/admin/lectures/" + lectureId + "/students");
    }

    // 강의별 학생 목록 조회
    public ApiResponse<Page<CourseStudent>> getStudents(Authentication authentication, Long lectureId, Pageable pageable){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 조회할 권한이 없습니다.");
        }

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "해당 강의를 찾을 수 없습니다."));

        Page<Enrollment> enrollments = enrollmentRepository.findByLecture_LectureId(lectureId, pageable);

        Page<CourseStudent> courseStudents = enrollments.map(enrollment -> {
            Student student = enrollment.getStudent();
            return CourseStudent.builder()
                    .studentId(student.getStudentId())
                    .studentNum(student.getStudentNum())
                    .studentName(student.getStudentName())
                    .build();
        });
        return ApiResponse.success(200, courseStudents, courseStudents.getTotalElements(), courseStudents.getTotalPages());
    }

    // 강의별 학생 삭제
    @Transactional
    public ActionResponse deleteStudent(Authentication authentication, Long lectureId, String studentNum){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 삭제할 권한이 없습니다.");
        }

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new CustomException(404, "해당 강의를 찾을 수 없습니다."));
        Student student = studentRepository.findByStudentNum(studentNum);
        if(student == null){
            throw new CustomException(404, "해당 학생을 찾을 수 없습니다.");
        }

        Enrollment enrollment = enrollmentRepository.findByStudentAndLecture(student, lecture);
        if (enrollment == null) {
            throw new CustomException(404, "해당 강의를 수강 중인 학생이 아닙니다.");
        }
        enrollmentRepository.delete(enrollment);
        return ActionResponse.success(200, "학생이 삭제되었습니다.", "/api/admin/lectures/" + lectureId + "/students");
    }

    // 학생 정보 등록
    @Transactional
    public ActionResponse studentRegister(Authentication authentication, JoinRequest joinRequest){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 등록할 권한이 없습니다.");
        }

        Student student = Student.builder()
                .studentName(joinRequest.getUserName())
                .studentNum(joinRequest.getUserNum())
                .studentEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.STUDENT)
                .studentStatus(StudentStatus.ENROLLED).build();

        studentRepository.save(student);

        return ActionResponse.success(201, "학생 정보가 등록되었습니다.", "/api/admin/students/register");
    }

    // 전체 학생 정보 조회
    public ApiResponse<Page<UserData>> getStudentData(Authentication authentication, Pageable pageable){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 조회할 권한이 없습니다.");
        }

        Page<Student> students = studentRepository.findAllByStudentStatusNot(StudentStatus.GRADUATED, pageable);

        Page<UserData> userData = students.map(student -> UserData.builder()
                .userId(student.getStudentId())
                .userName(student.getStudentName())
                .userNum(student.getStudentNum())
                .userEmail(student.getStudentEmail())
                .phoneNum(student.getPhoneNum())
                .status(student.getStudentStatus().getCode()).build());

        return ApiResponse.success(200, userData);

    }

    // 특정 학생 정보 조회
    public ApiResponse<UserData> getStudentDetailData(Authentication authentication, String studentNum){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 조회할 권한이 없습니다.");
        }

        Student student = studentRepository.findByStudentNum(studentNum);
        if(student == null){
            throw new CustomException(404, "존재하지 않는 학생입니다.");
        }

        UserData userData = UserData.builder()
                .userId(student.getStudentId())
                .userName(student.getStudentName())
                .userNum(student.getStudentNum())
                .userEmail(student.getStudentEmail())
                .phoneNum(student.getPhoneNum())
                .status(student.getStudentStatus().getCode()).build();

        return ApiResponse.success(200, userData);
    }

    // 학생 정보 수정
    @Transactional
    public ActionResponse editStudentData(Authentication authentication, String studentNum, UserEdit userEdit){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 수정할 권한이 없습니다.");
        }

        Student student = studentRepository.findByStudentNum(studentNum);
        if(student == null){
            throw new CustomException(404, "존재하지 않는 학생입니다.");
        }

        if(userEdit.getUserName() != null){
            student.setStudentName(userEdit.getUserName());
        }
        if(userEdit.getUserNum() != null){
            student.setStudentNum(userEdit.getUserNum());
        }
        if(userEdit.getEmail() != null){
            student.setStudentEmail(userEdit.getEmail());
        }
        if(userEdit.getPhoneNum() != null){
            student.setPhoneNum(userEdit.getPhoneNum());
        }
        if(userEdit.getStatus() != null){
            student.setStudentStatus(StudentStatus.of(userEdit.getStatus()));
        }

        studentRepository.save(student);

        return ActionResponse.success(200, "학생 정보가 수정되었습니다.", "/api/admin/students/" + studentNum);
    }

    // 학생 정보 삭제
    @Transactional
    public ActionResponse deleteStudent(Authentication authentication, String studentNum){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "학생을 삭제할 권한이 없습니다.");
        }

        Student student = studentRepository.findByStudentNum(studentNum);
        if(student == null){
            throw new CustomException(404, "존재하지 않는 학생입니다.");
        }

        studentRepository.delete(student);

        return ActionResponse.success(200, "학생 정보가 삭제되었습니다.", "/api/admin/students");
    }

    // 교수 정보 등록
    @Transactional
    public ActionResponse professorRegister(Authentication authentication, JoinRequest joinRequest){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "교수를 등록할 권한이 없습니다.");
        }

        Professor professor = Professor.builder()
                .professorName(joinRequest.getUserName())
                .professorNum(joinRequest.getUserNum())
                .professorEmail(joinRequest.getUserEmail())
                .password(passwordEncoder.encode(joinRequest.getPassword()))
                .phoneNum(joinRequest.getPhoneNum())
                .roleType(RoleType.PROFESSOR)
                .professorStatus(ProfessorStatus.EMPLOYED).build();

        professorRepository.save(professor);

        return ActionResponse.success(201, "교수 정보가 등록되었습니다.", "/api/admin/professors/register");
    }

    // 전체 교수 정보 조회
    public ApiResponse<Page<UserData>> getProfessorData(Authentication authentication, Pageable pageable){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "교수를 조회할 권한이 없습니다.");
        }

        Page<Professor> professors = professorRepository.findAllByProfessorStatusNot(ProfessorStatus.RETIRED, pageable);

        Page<UserData> userData = professors.map(professor -> UserData.builder()
                .userId(professor.getProfessorId())
                .userName(professor.getProfessorName())
                .userNum(professor.getProfessorNum())
                .userEmail(professor.getProfessorEmail())
                .phoneNum(professor.getPhoneNum())
                .status(professor.getProfessorStatus().getCode()).build());

        return ApiResponse.success(200, userData);

    }

    // 특정 교수 정보 조회
    public ApiResponse<UserData> getProfessorDetailData(Authentication authentication, String professorNum){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "교수를 조회할 권한이 없습니다.");
        }

        Professor professor = professorRepository.findByProfessorNum(professorNum);
        if(professor == null){
            throw new CustomException(404, "존재하지 않는 교수입니다.");
        }

        UserData userData = UserData.builder()
                .userId(professor.getProfessorId())
                .userName(professor.getProfessorName())
                .userNum(professor.getProfessorNum())
                .userEmail(professor.getProfessorEmail())
                .phoneNum(professor.getPhoneNum())
                .status(professor.getProfessorStatus().getCode()).build();

        return ApiResponse.success(200, userData);
    }

    // 교수 정보 수정
    @Transactional
    public ActionResponse editProfessorData(Authentication authentication, String professorNum, UserEdit userEdit){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "교수를 수정할 권한이 없습니다.");
        }

        Professor professor = professorRepository.findByProfessorNum(professorNum);
        if(professor == null){
            throw new CustomException(404, "존재하지 않는 교수입니다.");
        }

        if(userEdit.getUserName() != null){
            professor.setProfessorName(userEdit.getUserName());
        }
        if(userEdit.getUserNum() != null){
            professor.setProfessorNum(userEdit.getUserNum());
        }
        if(userEdit.getEmail() != null){
            professor.setProfessorEmail(userEdit.getEmail());
        }
        if(userEdit.getPhoneNum() != null){
            professor.setPhoneNum(userEdit.getPhoneNum());
        }
        if(userEdit.getStatus() != null){
            professor.setProfessorStatus(ProfessorStatus.of(userEdit.getStatus()));
        }

        professorRepository.save(professor);

        return ActionResponse.success(200, "교수 정보가 수정되었습니다.", "/api/admin/professors/" + professorNum);
    }

    // 교수 정보 삭제
    @Transactional
    public ActionResponse deleteProfessor(Authentication authentication, String professorNum){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "교수를 삭제할 권한이 없습니다.");
        }

        Professor professor = professorRepository.findByProfessorNum(professorNum);
        if(professor == null){
            throw new CustomException(404, "존재하지 않는 교수입니다.");
        }

        professorRepository.delete(professor);

        return ActionResponse.success(200, "교수 정보가 삭제되었습니다.", "/api/admin/professors");
    }

    // 사진 변경 요청 목록 조회(대기중)
    public ApiResponse<Page<PhotoData>> getPhotoRequest(Authentication authentication, Pageable pageable){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "사진 변경 요청을 조회할 권한이 없습니다.");
        }

        Page<Image> pendingCenterImages = imageRepository.findByImageTypeAndStatusAndPosition(
                ImageType.REQUESTED, Status.PENDING, ImagePosition.CENTER, pageable
        );

        Page<PhotoData> photoData = pendingCenterImages.map(image -> {
            Student student = image.getStudent();
            String reqId = image.getRequestId();
            List<PhotoData.Photo> profileImages = List.of(
                    createProfileImage(student.getStudentNum(), ImagePosition.LEFT, "l"),
                    createProfileImage(student.getStudentNum(), ImagePosition.CENTER, "c"),
                    createProfileImage(student.getStudentNum(), ImagePosition.RIGHT, "r")
            );

            return PhotoData.builder()
                    .requestId(reqId)
                    .studentId(student.getStudentId())
                    .studentNum(student.getStudentNum())
                    .studentName(student.getStudentName())
                    .photos(profileImages)
                    .requestDate(student.getImages().getFirst().getImageCreated().toString())
                    .status(Status.PENDING.getCode()).build();
        });

        return ApiResponse.success(200, photoData);
    }
    private PhotoData.Photo createProfileImage(String userNum, ImagePosition position, String suffix) {
        Student student = studentRepository.findByStudentNum(userNum);
        String displayUrl = imageRepository.findByStudentAndPositionAndImageType(student, position, ImageType.REQUESTED)
                .map(img -> "/api/mypage/image/" + Paths.get(img.getFilePath()).getFileName().toString())
                .orElse(null);

        return PhotoData.Photo.builder()
                .orientation(position.toString())
                .url(displayUrl) // 브라우저가 이 주소로 GET 요청을 보냅니다.
                .build();
    }

    // 사진 변경 처리 완료 조회
    public ApiResponse<Page<PhotoComplete>> getPhotoComplete(Authentication authentication, Pageable pageable){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "사진 변경 요청 처리 완료을 조회할 권한이 없습니다.");
        }

        Page<Image> completedCenterImages = imageRepository.findByStatusNotAndPosition(
                Status.PENDING, ImagePosition.CENTER, pageable
        );

        Page<PhotoComplete> photoCompletes = completedCenterImages.map(image -> {
                Student student = image.getStudent();
                return PhotoComplete.builder()
                        .studentNum(student.getStudentNum())
                        .studentName(student.getStudentName())
                        .accessDate(image.getImageModified().toString())
                        .status(image.getStatus().toString())
                        .rejectReason(image.getRejectReason() != null ? image.getRejectReason() : "").build();
        });

        return ApiResponse.success(200, photoCompletes);
    }





    // 사진 변경 요청 상세 조회
    public ApiResponse<PhotoDetailData> getPhotoDetailData(Authentication authentication, String requestId){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "사진 변경 요청 상세를 조회할 권한이 없습니다.");
        }

        List<Image> requestedImages = imageRepository.findByRequestId(requestId);
        if (requestedImages.isEmpty()) {
            throw new CustomException(404, "해당 요청 정보를 찾을 수 없습니다.");
        }

        Student student = requestedImages.get(0).getStudent();
        List<Image> currentImages = imageRepository.findByStudentAndImageType(student, ImageType.CURRENT);

        List<PhotoDetailData.Photo> requestedPhotos = requestedImages.stream()
                .map(image -> PhotoDetailData.Photo.builder()
                        .orientation(image.getPosition().toString())
                        .url("/api/admin/image/" + Paths.get(image.getFilePath()).getFileName().toString())
                        .build())
                .toList();

        List<PhotoDetailData.Photo> currentPhotos = currentImages.stream()
                .map(image -> PhotoDetailData.Photo.builder()
                        .orientation(image.getPosition().toString())
                        .url("/api/admin/image/" + Paths.get(image.getFilePath()).getFileName().toString())
                        .build())
                .toList();

        PhotoDetailData photoDetailData = PhotoDetailData.builder()
                .requestId(requestId)
                .studentId(student.getStudentId())
                .studentNum(student.getStudentNum())
                .studentName(student.getStudentName())
                .requestDate(requestedImages.getFirst().getImageCreated().toString())
                .status(Status.PENDING.getCode())
                .currentPhotos(currentPhotos)
                .requestedPhotos(requestedPhotos).build();

        return ApiResponse.success(200, photoDetailData);
    }

    // 사진 변경 요청 승인/반려
    @Transactional
    public ActionResponse approvePhoto(Authentication authentication, String requestId, PhotoCompleteRequest request){
        String userNum = authentication.getName();
        Master master = masterRepository.findByMasterNum(userNum);
        if (master == null) throw new CustomException(404, "관리자 정보를 찾을 수 없습니다.");

        if (master.getRoleType() != RoleType.MASTER) {
            throw new CustomException(403, "사진 변경 요청을 승인/반려할 권한이 없습니다.");
        }

        List<Image> images  = imageRepository.findByRequestId(requestId);
        Student student = images.getFirst().getStudent(); // 요청한 학생 정보 가져오기
        if(student == null){
            throw new CustomException(404, "존재하지 않는 학생입니다.");
        }
        if (images.isEmpty()) {
            throw new CustomException(404, "해당 요청의 사진을 찾을 수 없습니다.");
        }
        if (request.getApprovalStatus().equals("APPROVED")) {
            // 기존에 사용 중이던 CURRENT 사진들 조회
            List<Image> currentImages = imageRepository.findByStudentAndImageType(student, ImageType.CURRENT);

            if (!currentImages.isEmpty()) {
                for (Image currentImage : currentImages) {
                    currentImage.setImageType(ImageType.ARCHIVED);
                    imageRepository.save(currentImage);
                }
            }
        }

        for(Image image : images){
            image.setStatus(Status.of(request.getApprovalStatus()));
            if(request.getApprovalStatus().equals("REJECTED")){
                if(request.getRejectReason() == null){
                    throw new CustomException(404, "반려 사유를 작성하세요");
                }
                image.setRejectReason(request.getRejectReason());
                image.setImageType(ImageType.REJECTED);
            }
            else{
                image.setImageType(ImageType.CURRENT);
            }
            imageRepository.save(image);
        }
        Notification notification = null;
        if(request.getApprovalStatus().equals("REJECTED")){
            notification = Notification.builder()
                    .message(student.getStudentName() + "학생의 프로필 변경 요청이 반려되었습니다.")
                    .relatedId(images.getFirst().getRequestId())
                    .isRead(false)
                    .noticeType(NoticeType.PHOTO_RESULT)
                    .student(images.getFirst().getStudent())
                    .build();
        }
        else{
            notification = Notification.builder()
                    .message(student.getStudentName() + "학생의 프로필 변경 요청이 승인되었습니다.")
                    .relatedId(images.getFirst().getRequestId())
                    .isRead(false)
                    .noticeType(NoticeType.PHOTO_RESULT)
                    .student(images.getFirst().getStudent())
                    .build();
        }
        notificationRepository.save(notification);

        return ActionResponse.success(200, "사진 변경 요청이 처리되었습니다.", "/api/admin/photo-requests");
    }
}
