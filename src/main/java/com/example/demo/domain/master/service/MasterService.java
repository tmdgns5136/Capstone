package com.example.demo.domain.master.service;

import com.example.demo.domain.enumerate.RoleType;
import com.example.demo.domain.master.dto.AddRequest;
import com.example.demo.domain.master.dto.CourseData;
import com.example.demo.domain.master.dto.CourseRequest;
import com.example.demo.domain.master.dto.CourseStudent;
import com.example.demo.domain.master.entity.Master;
import com.example.demo.domain.master.repository.MasterRepository;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.lecture.entity.Enrollment;
import com.example.demo.domain.student.lecture.entity.Lecture;
import com.example.demo.domain.student.lecture.repository.EnrollmentRepository;
import com.example.demo.domain.student.lecture.repository.LectureRepository;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MasterService {
    private final ProfessorRepository professorRepository;
    private final MasterRepository masterRepository;
    private final LectureRepository lectureRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

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
        System.out.println(courseRequest.getProfessorNum());
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
                            .division(lecture.getLectureDivision()).build();

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
        System.out.println(enrollment.getEnrollmentId());
        if (enrollment == null) {
            throw new CustomException(404, "해당 강의를 수강 중인 학생이 아닙니다.");
        }
        enrollmentRepository.delete(enrollment);
        return ActionResponse.success(200, "학생이 삭제되었습니다.", "/api/admin/lectures/" + lectureId + "/students");
    }
}
