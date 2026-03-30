package com.example.demo.mypage.service;

import com.example.demo.entity.enumerate.ImagePosition;
import com.example.demo.entity.enumerate.Status;
import com.example.demo.home.dto.CommonResponse;
import com.example.demo.home.dto.user.ImgDto;
import com.example.demo.home.entity.etc.Image;
import com.example.demo.home.entity.user.Professor;
import com.example.demo.home.entity.user.Student;
import com.example.demo.home.service.FileService;
import com.example.demo.home.user.ImageRepository;
import com.example.demo.home.user.ProfessorRepository;
import com.example.demo.home.user.StudentRepository;
import com.example.demo.mypage.dto.ImgRequestList;
import com.example.demo.mypage.dto.InquiryResponse;
import com.example.demo.home.util.FileUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    // 마이페이지 조회
    public InquiryResponse inquiry(Authentication authentication){
        String userNum = authentication.getName();
        InquiryResponse inquiryResponse = null;

        Student student = studentRepository.findByStudentNum(userNum);
        if(student != null){
            List<InquiryResponse.ProfileImage> profileImages = List.of(
                    createProfileImage(userNum, ImagePosition.LEFT, "l"),
                    createProfileImage(userNum, ImagePosition.CENTER, "c"),
                    createProfileImage(userNum, ImagePosition.RIGHT, "r")
            );

            inquiryResponse = InquiryResponse.builder()
                    .status(200)
                    .success(true)
                    .data(InquiryResponse.InquiryData.builder()
                            .userName(student.getStudentName())
                            .userNum(student.getStudentNum())
                            .phoneNum(student.getPhoneNum())
                            .userEmail(student.getStudentEmail())
                            .faceRegistrationsStatus("PENDING")
                            .profileImages(profileImages)
                            .build())
                    .build();
        }
        Professor professor = professorRepository.findByProfessorNum(userNum);
        if(professor != null){
            inquiryResponse = InquiryResponse.builder()
                    .status(200)
                    .success(true)
                    .data(InquiryResponse.InquiryData.builder()
                            .userName(professor.getProfessorName())
                            .userNum(professor.getProfessorNum())
                            .phoneNum(professor.getPhoneNum())
                            .userEmail(professor.getProfessorEmail()).build()).build();
        }
        return inquiryResponse;
    }
    private InquiryResponse.ProfileImage createProfileImage(String userNum, ImagePosition position, String orientation) {
        ImgDto imgDto = fileService.getFileByPosition(userNum, position);
        String path = (imgDto != null) ? imgDto.getFilePath() : "C:/Users/lsh/Desktop/photo/1.png";

        return InquiryResponse.ProfileImage.builder()
                .orientation(orientation)
                .url(path)
                .build();
    }

    // 회원 탈퇴
    @Transactional
    public CommonResponse withDraw(Authentication authentication){
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

        CommonResponse commonResponse = CommonResponse.builder()
                .status(200)
                .success(true)
                .message("회원 탈퇴가 성공적으로 처리되었습니다. 그동안 이용해주셔서 감사합니다.")
                .redirectUrl("/api/home").build();
        return commonResponse;
    }

    // 프로필 이미지 변경 요청
    @Transactional
    public CommonResponse imgRequest(MultipartFile leftImage, MultipartFile centerImage,
                                     MultipartFile rightImage, Authentication authentication) throws IOException {

        if(!fileService.checkImage(leftImage) || !fileService.checkImage(centerImage) || !fileService.checkImage(rightImage)){
            CommonResponse commonResponse = CommonResponse.builder()
                    .status(400)
                    .success(false)
                    .message("이미지가 아닙니다. 이미지를 입력해주세요").build();
            return commonResponse;
        }

        if(!fileService.checkExtension(leftImage) || !fileService.checkExtension(centerImage) || !fileService.checkExtension(rightImage)){
            CommonResponse commonResponse = CommonResponse.builder()
                    .status(400)
                    .success(false)
                    .message("이미지 형식이 맞지 않습니다. jpg, jpeg, png로 등록해주세요.").build();
            return commonResponse;
        }


        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

//        LocalDateTime start = LocalDate.now().atStartOfDay();
//        if(imageRepository.existsByStudentAndImageCreatedAfter(student, start)){
//            CommonResponse commonResponse = CommonResponse.builder()
//                    .status(429)
//                    .success(false)
//                    .message("사진 변경 요청은 1일 1회만 가능합니다.").build();
//            return commonResponse;
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

        ImgDto leftImgDto = fileUtil.getFIleDtoFromMultipartFile(leftImage, ImagePosition.LEFT);
        ImgDto centerImgDto = fileUtil.getFIleDtoFromMultipartFile(centerImage, ImagePosition.CENTER);
        ImgDto rightImgDto = fileUtil.getFIleDtoFromMultipartFile(rightImage, ImagePosition.RIGHT);

        fileService.saveImage(leftImgDto, userNum, requestId);
        fileService.saveImage(centerImgDto, userNum, requestId);
        fileService.saveImage(rightImgDto, userNum, requestId);

        return CommonResponse.builder()
                .status(200)
                .success(true)
                .message("변경 요청이 완료되었습니다.").build();

    }

    // 변경 요청 내역 확인
    public ImgRequestList getList(Authentication authentication){
        String userNum = authentication.getName();
        Student student = studentRepository.findByStudentNum(userNum);

        List<Image> allImages = imageRepository.findByStudent(student);
        // requestId를 기준으로 그룹화
        Map<String, List<Image>> groupedByRequest = allImages.stream()
                .filter(img -> img.getRequestId() != null)
                .collect(Collectors.groupingBy(Image::getRequestId));

        List<ImgRequestList.ListData> dataList = groupedByRequest.entrySet().stream()
                .map(entry->{
                    List<Image> images = entry.getValue();
                    Image first = images.getFirst();

                    return ImgRequestList.ListData.builder()
                            .requestId(entry.getKey())
                            .requestDate(first.getImageCreated().toLocalDate().toString())
                            .status(first.getStatus().name())
                            .rejectReason(first.getRejectReason())
                            .profileImages(images.stream()
                                    .map(img-> ImgRequestList.ProfileImages
                                            .builder().orientation(img.getPosition().name())
                                            .url(img.getFilePath()).build())
                                    .collect(Collectors.toList())).build();

                }).sorted(Comparator.comparing(ImgRequestList.ListData::getRequestDate).reversed())
                .collect(Collectors.toList());


        return ImgRequestList.builder()
                .status(200).success(true).data(dataList).build();
    }
}
