# 스마트 출결 시스템 (Smart Attendance System)

AWS Rekognition 얼굴 인식 기반 대학교 자동 출결 관리 웹 애플리케이션

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS v4, MUI, shadcn/ui (Radix UI), Motion, Recharts, Lucide Icons
- **Backend**: Spring Boot (REST API, `localhost:8080`)
- **AI/ML**: AWS Rekognition (얼굴 인식)
- **기타**: React Router v7, React Hook Form, react-webcam, SheetJS (xlsx 내보내기)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

Vite 개발 서버가 실행되며, `/api` 요청은 `http://127.0.0.1:8080`으로 프록시됩니다.

> 백엔드 서버가 `localhost:8080`에서 실행 중이어야 API 연동이 정상 동작합니다.

서버 실행 후 브라우저에서 `http://localhost:5173` 으로 접속하세요.

## 주요 기능

### 학생 (Student)
- 얼굴 사진(정면/좌측/우측) 기반 회원가입
- 실시간 출석 현황 및 수업별 출석률 통계
- 시간표 조회
- 결석 사유서 제출
- 프로필 사진 변경 요청

### 교수 (Professor)
- 강의별 출석 관리 및 수동 수정
- 라즈베리파이 카메라 실시간 모니터링
- 결석 사유서 / 이의 신청 관리
- 출석부 엑셀 내보내기
- 강의 공지사항 및 Q&A

### 관리자 (Admin)
- 학생/교수 계정 관리
- 강좌 및 수업 관리
- IoT 카메라 기기 관리
- 사진 변경 요청 승인/반려
- 시스템 전체 통계 대시보드

## 프로젝트 구조

```
├── src/
│   ├── app/
│   │   ├── api/              # API 클라이언트 (auth, mypage, 공통 client)
│   │   ├── components/       # 재사용 컴포넌트
│   │   │   ├── layout/       # TopNav, Footer
│   │   │   └── ui/           # shadcn/ui 기반 UI 컴포넌트
│   │   ├── constants/        # 상수 정의 (출석 상태 등)
│   │   ├── hooks/            # 커스텀 훅 (인증, 테마, 과목, 시뮬레이터 등)
│   │   ├── layouts/          # RootLayout
│   │   ├── pages/
│   │   │   ├── student/      # 학생 페이지 (대시보드, 수업, 통계, 프로필 등)
│   │   │   ├── professor/    # 교수 페이지 (대시보드, 출석, 모니터링, 내보내기 등)
│   │   │   ├── admin/        # 관리자 페이지 (대시보드, 학생/교수/강좌/기기 관리)
│   │   │   └── shared/       # 공통 페이지 (알림)
│   │   ├── routes.tsx        # React Router 라우팅 설정
│   │   └── App.tsx           # 메인 앱 컴포넌트
│   └── styles/               # 글로벌 스타일 (Tailwind, fonts, theme)
├── public/                   # 정적 파일 (얼굴 등록 가이드 이미지 등)
├── utils/                    # 유틸리티 (Supabase 설정 등)
├── vite.config.ts            # Vite 설정 (프록시, 경로 별칭)
└── index.html                # HTML 엔트리 포인트
```

## API 연동

프론트엔드는 `/api/home` 기본 경로로 백엔드 REST API와 통신합니다.

- JWT 기반 인증 (Access Token + Refresh Token)
- 401 응답 시 자동 토큰 재발급 후 재시도
- FormData 지원 (얼굴 사진 업로드)

## 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 라이선스

This project is private and confidential.
