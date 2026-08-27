# ASaaS - 스마트 출결 시스템 (Smart Attendance System)
> **ASaaS** (Attendance Software as a Service) | Team 천천히, 꾸준히

AWS Rekognition 얼굴 인식 기반 대학교 자동 출결 관리 웹 애플리케이션
<<<<<<< HEAD

## 기술 스택
- **Language**: Java
- **Framework**: Spring Boot
- **Database**: MySQL
- **Security**: Spring Security, JWT (Access/Refresh Token)
- **AI**: AWS SDK for Java (AWS Rekognition)

## 주요 기능

### 학생 (Student)
- 얼굴 사진(정면/좌측/우측) 기반 회원가입
- 실시간 출석 현황 및 수업별 출석률 통계
- 시간표 조회
- 공결 신청
- 프로필 사진 변경 요청

### 교수 (Professor)
- 강의별 출석 관리 및 수동 수정
- 라즈베리파이 카메라 실시간 모니터링
- 공결 신청 / 이의 신청 관리
- 출석부 엑셀 내보내기
- 강의 공지사항 및 Q&A

## YOLO 적용 실시간 스트림

교수 화면의 강의 제어에서 강의를 시작하면 백엔드가 YOLO 워커를 실행합니다. 워커는 원본 RTSP 스트림을 읽고, 사람 인식 박스가 그려진 영상을 MediaMTX의 별도 path로 다시 송출합니다.

- 원본 입력 기본값: `rtsp://127.0.0.1:8554/{deviceId}`
- YOLO 출력 기본값: `rtsp://127.0.0.1:8554/{deviceId}-yolo`
- 웹 화면 기본 예시: `http://100.68.215.22:8889/RPI-G101-001-yolo`

서버 PC에는 `ffmpeg`가 설치되어 있고 PATH에서 실행 가능해야 합니다. PATH에 없다면 `YOLO_WORKER_FFMPEG_COMMAND`에 `ffmpeg.exe`의 절대 경로를 설정하세요.

`YOLO_WORKER_COMMAND`는 `ultralytics`, `opencv-python`, `requests`가 설치된 Python 실행 파일이어야 합니다. Windows에서 `python`이 PATH에 없다면 `C:/.../python.exe`처럼 절대 경로로 지정하세요.

### 관리자 (Admin)
- 학생/교수 계정 관리
- 강좌 및 수업 관리
- IoT 카메라 기기 관리
- 사진 변경 요청 승인/반려
- 시스템 전체 통계 대시보드

## 프로젝트 구조
src/main/java/com/example/demo/

domain/ (도메인별 비즈니스 로직 및 엔티티)
-  attendance/ : 출결 관리
-  device/ : IoT 기기 관리
-  umerate/ : 상수 및 열거형 정의
-  ster/ : 관리자 관련 기능
-  professor/ : 교수 관련 기능
-  recognition/ : AWS Rekognition 얼굴 인식 로직
-  stream/ : 데이터 스트리밍 처리
-  student/ : 학생 관련 기능

global/ (전역 설정 및 공통 컴포넌트)
-  aws/ : AWS SDK 설정
-  config/ : Spring Boot 보안 및 서비스 설정
-  exception/ : 전역 예외 처리
-  jwt/ : 인증 및 JWT 토큰 처리
-  mqtt/ : MQTT 통신 로직
-  response/ : 공통 API 응답 규격
=======
>>>>>>> origin/backend
