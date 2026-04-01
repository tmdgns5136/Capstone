# 스마트 출결 시스템 (Smart Attendance System)

Amazon Rekognition, React, Supabase, 라즈베리파이 카메라를 활용한 대학교 자동 출결 관리 B2B SaaS 웹 애플리케이션

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS v4, Motion (Framer Motion), shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Server**: Hono (Deno Edge Function)
- **AI/ML**: AWS Rekognition (얼굴 인식)
- **IoT**: 라즈베리파이 카메라 모듈

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, Supabase 프로젝트 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속하세요.

## 주요 기능

### 학생 (Student)
- 얼굴 인식 기반 회원가입
- 실시간 출석 현황 조회
- 수업별 출석률 통계
- 결석 사유서 제출

### 교수 (Professor)
- 강의실 카메라 실시간 모니터링
- 자동 출석 체크 및 수동 수정
- 출석부 엑셀 내보내기
- 학생별 출석 통계 분석

### 관리자 (Admin)
- 학생/교수 계정 관리
- 강좌 및 수업 관리
- IoT 카메라 기기 관리
- 시스템 전체 통계 대시보드

## 데모 모드

실제 서버 연동 없이 프론트엔드를 테스트하려면 로그인 페이지에서 **"데모 로그인"** 버튼을 클릭하세요.

## 프로젝트 구조

```
/
├── src/
│   ├── app/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트 (student, professor, admin)
│   │   ├── layouts/       # 레이아웃 컴포넌트
│   │   ├── lib/           # Supabase 클라이언트 등 라이브러리
│   │   ├── routes.tsx     # React Router 설정
│   │   └── App.tsx        # 메인 앱 컴포넌트
│   ├── styles/            # 글로벌 스타일 (Tailwind, fonts, theme)
│   └── main.tsx           # 앱 엔트리 포인트
├── supabase/
│   └── functions/
│       └── server/        # Hono 서버 (Edge Function)
├── .env                   # 환경 변수 (gitignore)
└── index.html             # HTML 엔트리 포인트
```

## 디자인 시스템

- **컬러**:
  - Primary (학생): `#00E5FF` (Cyan)
  - Primary (교수): `#FF0055` (Pink)
  - Accent: `#FFF500` (Yellow)
  - Background: `#F0EFEB` (Warm Gray)
- **테마**: 벤토 그리드, 리니어 다크, 글래스모피즘
- **폰트**: Mono (시스템 폰트)

## 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 라이선스

This project is private and confidential.
