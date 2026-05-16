# Capstone merged server notes

기준 방향: `Capstone-Jeongtaek`을 베이스로 유지하고, 충돌 시 정택 서버의 패키지 구조/DB 구조/교수 출석 종료 체류율 계산 로직을 우선했습니다.

## 이식한 요한 서버 기능

- `domain/device/**`
  - 장치 등록/로그인/config/이미지 업로드/업로드 결과 조회/heartbeat/log API
  - MQTT command ack/error/heartbeat 저장
  - START_CAPTURE / STOP_CAPTURE MQTT 발행
- `domain/stream/**`
  - 실시간 객체탐지 결과 저장 API
  - 사람 수 변화 이벤트 저장 API
  - YOLO worker 프로세스 제어 서비스
- `domain/recognition/**`
  - 업로드 이미지 기반 AWS Rekognition 얼굴 비교
  - 인식 결과 저장 및 출석 처리
- `global/mqtt/**`, `global/aws/**`
  - MQTT inbound/outbound 설정
  - AWS Rekognition Bean 설정

## 정택 서버 우선 유지한 부분

- `domain/student/**`, `domain/master/**`, `domain/professor/**`의 기존 구조 유지
- `ProfessorService.endLecture()`의 체류율 계산 방식 유지
- `application.yaml`의 DB 이름 `attendance_db` 유지
- 정택 서버의 관리자/학생/교수 기능 유지

## 병합하면서 맞춘 부분

- 요한 코드의 기존 패키지 참조를 정택 구조로 변경
  - `domain.lecture.*` → `domain.student.lecture.*`
  - `domain.home.*` → `domain.student.home.*`
  - `domain.entity.enumerate.*` → `domain.enumerate.*`
- `RoleType`에 `DEVICE("ROLE_DEVICE", "장치 권한")` 추가
- `LectureSessionRepository`에 현재 강의실에서 진행 중인 세션 조회 메서드 추가
- `SecurityConfig`에 `/api/device/register`, `/api/device/login` 허용 추가
- `DemoApplication`에 `@EnableAsync` 추가
- `ProfessorService.startLecture()`에서 강의실 활성 장치 조회 후 `START_CAPTURE` MQTT 발행 추가
- `ProfessorService.endLecture()`에서 `STOP_CAPTURE` MQTT 발행 추가
- YOLO worker 자동 실행은 기본 비활성화했습니다. 로컬 경로가 사람마다 달라 서버 실행이 깨지는 것을 막기 위해서입니다.

## 실행 전 확인할 것

1. MySQL에 `attendance_db`가 있어야 합니다.
2. `MAIL_PASSWORD` 환경변수가 없으면 메일 설정 때문에 실행 중 오류가 날 수 있습니다.
3. MQTT를 사용하려면 Mosquitto가 `tcp://localhost:1883`에서 실행 중이어야 합니다.
4. AWS Rekognition을 쓰려면 AWS 자격 증명이 환경변수, AWS CLI profile, IAM Role 중 하나로 잡혀 있어야 합니다.
5. 교수 강의 시작 버튼을 누르기 전에 해당 강의실과 같은 `classroom` 값으로 장치를 먼저 등록해야 합니다.

## YOLO worker 자동 실행을 켜야 하는 경우

`application.yaml` 또는 환경변수로 아래 값을 지정하세요.

```yaml
stream:
  yolo:
    worker:
      enabled: true
      command: python
      script: yolo_stream_worker.py
      directory: C:\\Users\\yohan\\Desktop\\yolo-stream
```

또는 환경변수:

- `YOLO_WORKER_ENABLED=true`
- `YOLO_WORKER_COMMAND=python`
- `YOLO_WORKER_SCRIPT=yolo_stream_worker.py`
- `YOLO_WORKER_DIRECTORY=C:\Users\yohan\Desktop\yolo-stream`
