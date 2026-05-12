package com.example.demo.domain.student.mypage.service;

import com.example.demo.domain.enumerate.ImagePosition;
import com.example.demo.domain.enumerate.Status;
import com.example.demo.domain.student.home.dto.user.EditRequest;
import com.example.demo.domain.student.home.dto.user.ImgDto;
import com.example.demo.domain.student.home.entity.etc.Image;
import com.example.demo.domain.professor.entity.Professor;
import com.example.demo.domain.student.home.entity.user.Student;
import com.example.demo.domain.student.home.service.FileService;
import com.example.demo.domain.student.home.repository.ImageRepository;
import com.example.demo.domain.professor.repository.ProfessorRepository;
import com.example.demo.domain.student.home.repository.StudentRepository;
import com.example.demo.domain.student.home.util.FileUtil;
import com.example.demo.domain.student.mypage.dto.InquiryData;
import com.example.demo.domain.student.mypage.dto.ListData;
import com.example.demo.global.exception.CustomException;
import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPageService {
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final ImageRepository imageRepository;
    private final FileUtil fileUtil;
    private final FileService fileService;
    private final PasswordEncoder passwordEncoder;

    // 마이페이지 조회
    public ApiResponse<InquiryData> inquiry(Authentication authentication){
        String userNum = authentication.getName();
        InquiryData inquiryData = null;

        Student student = studentRepository.findByStudentNum(userNum);
        if(student != null){
            List<InquiryData.ProfileImage> profileImages = List.of(
                    createProfileImage(userNum, ImagePosition.LEFT, "l"),
                    createProfileImage(userNum, ImagePosition.CENTER, "c"),
                    createProfileImage(userNum, ImagePosition.RIGHT, "r")
            );

            inquiryData = InquiryData.builder()
                    .userName(student.getStudentName())
                    .userNum(student.getStudentNum())
                    .phoneNum(student.getPhoneNum())
                    .userEmail(student.getStudentEmail())
                    .faceRegistrationsStatus("")
                    .profileImages(profileImages)
                    .build();
        }
        Professor professor = professorRepository.findByProfessorNum(userNum);
        if(professor != null){
            inquiryData = InquiryData.builder()
                    .userName(professor.getProfessorName())
                    .userNum(professor.getProfessorNum())
                    .major(professor.getMajor())
                    .phoneNum(professor.getPhoneNum())
                    .userEmail(professor.getProfessorEmail()).build();
        }
        return ApiResponse.success(200, inquiryData);
    }
    private InquiryData.ProfileImage createProfileImage(String userNum, ImagePosition position, String suffix) {
        Student student = studentRepository.findByStudentNum(userNum);
        String displayUrl = imageRepository.findByStudentAndPosition(student, position)
                .map(img -> "/api/mypage/image/" + Paths.get(img.getFilePath()).getFileName().toString())
                .orElse(null);

        return InquiryData.ProfileImage.builder()
                .orientation(position.toString())
                .url(displayUrl) // 브라우저가 이 주소로 GET 요청을 보냅니다.
                .build();
    }

    // 정보 수정
    @Transactional
    public void edit(EditRequest editRequest, Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if(student != null){
            if(editRequest.getNewPassword() != null){
                student.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            if(editRequest.getPhoneNum() != null){
                student.setPhoneNum(editRequest.getPhoneNum());
            }
            studentRepository.save(student);
        }

        Professor professor = professorRepository.findByProfessorNum(userNum);
        if(professor != null){
            if(editRequest.getNewPassword() != null){
                professor.setPassword(passwordEncoder.encode(editRequest.getNewPassword()));
            }
            if(editRequest.getPhoneNum() != null){
                professor.setPhoneNum(editRequest.getPhoneNum());
            }

            if(editRequest.getUserEmail() != null){
                Professor emailOwner = professorRepository.findByProfessorEmail(editRequest.getUserEmail());

                if(emailOwner != null && !emailOwner.getProfessorId().equals(professor.getProfessorId())){
                    throw new CustomException(409, "이미 사용 중인 이메일입니다.");
                }

                professor.setProfessorEmail(editRequest.getUserEmail());
            }

            professorRepository.save(professor);
        }
    }

    // 회원 탈퇴
    @Transactional
    public ActionResponse withDraw(Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);
        if(student != null){
            List<Image> userImages = imageRepository.findByStudent(student);
            for (Image img : userImages) {
                // 서버에서 실제 파일 삭제
                fileUtil.deleteFileByFilePath(img.getFilePath());
                // DB에서 이미지 레코드 삭제
                imageRepository.delete(img);
            }
            studentRepository.deleteById(student.getStudentId());
        }
        Professor professor = professorRepository.findByProfessorNum(userNum);
        if(professor != null){
            professorRepository.deleteById(professor.getProfessorId());
        }

        return ActionResponse.success(200, "회원 탈퇴가 성공적으로 처리되었습니다. 그동안 이용해주셔서 감사합니다.", "/api/home");
    }

    // 프로필 이미지 변경 요청
    @Transactional
    public ActionResponse imgRequest(MultipartFile leftImage, MultipartFile centerImage,
                                     MultipartFile rightImage, Authentication authentication) throws IOException {

        if(!fileService.checkImage(leftImage) || !fileService.checkImage(centerImage) || !fileService.checkImage(rightImage)){
            throw new CustomException(400, "이미지가 아닙니다. 이미지를 입력해주세요.");
        }

        if(!fileService.checkExtension(leftImage) || !fileService.checkExtension(centerImage) || !fileService.checkExtension(rightImage)){
            throw new CustomException(400, "이미지가 형식이 맞지 않습니다. jpg, jpeg, png로 등록해주세요.");
        }


        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

//        LocalDateTime start = LocalDate.now().atStartOfDay();
//        if(imageRepository.existsByStudentAndImageCreatedAfter(student, start)){
//            throw new CustomException(409, "사진 변경 요청은 1일 1회만 가능합니다.");
//        }
        String requestId = "REQ-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5);

        List<Image> pendingImages = imageRepository.findByStudentAndStatus(student, Status.PENDING);
        if(!pendingImages.isEmpty()){
            for(Image pending : pendingImages){
                fileUtil.deleteFileByFilePath(pending.getFilePath());
                imageRepository.delete(pending);
            }
            imageRepository.flush();
        }

        ImgDto leftImgDto = fileUtil.getFIleDtoFromMultipartFile(leftImage, ImagePosition.LEFT, student.getStudentNum());
        ImgDto centerImgDto = fileUtil.getFIleDtoFromMultipartFile(centerImage, ImagePosition.CENTER, student.getStudentNum());
        ImgDto rightImgDto = fileUtil.getFIleDtoFromMultipartFile(rightImage, ImagePosition.RIGHT, student.getStudentNum());

        fileService.saveImage(leftImgDto, userNum, requestId);
        fileService.saveImage(centerImgDto, userNum, requestId);
        fileService.saveImage(rightImgDto, userNum, requestId);

        return ActionResponse.success(200, "변경 요청이 완료되었습니다.");
    }

    // 변경 요청 내역 확인
    public ApiResponse<List<ListData>> getList(Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        List<Image> allImages = imageRepository.findByStudent(student);
        // requestId를 기준으로 그룹화
        Map<String, List<Image>> groupedByRequest = allImages.stream()
                .filter(img -> img.getRequestId() != null)
                .collect(Collectors.groupingBy(Image::getRequestId));

        List<ListData> dataList = groupedByRequest.entrySet().stream()
                .map(entry->{
                    List<Image> images = entry.getValue();
                    Image first = images.getFirst();

                    return ListData.builder()
                            .requestId(entry.getKey())
                            .requestDate(first.getImageCreated().toLocalDate().toString())
                            .status(first.getStatus().name())
                            .rejectReason(first.getRejectReason())
                            .profileImages(images.stream()
                                    .map(img-> ListData.ProfileImages
                                            .builder().orientation(img.getPosition().name())
                                            .url("/api/mypage/image/" + Paths.get(img.getFilePath()).getFileName().toString()).build())
                                    .collect(Collectors.toList())).build();

                }).sorted(Comparator.comparing(ListData::getRequestDate).reversed())
                .collect(Collectors.toList());


        return ApiResponse.success(200, dataList);
    }
}
