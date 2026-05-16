# 로컬 개발 환경 설정 가이드

## ✅ 완료된 작업

1. **환경 변수 설정**
   - `.env` 파일 생성 완료
   - `.env.example` 템플릿 생성 완료
   - `src/vite-env.d.ts` TypeScript 타입 정의 완료

2. **Supabase 클라이언트 설정**
   - `/src/app/lib/supabase.ts` 에서 `import.meta.env` 방식으로 변경
   - Figma Make의 `/utils/supabase/info` 의존성 제거

3. **회원가입 페이지 수정**
   - `StudentSignup.tsx`: import 경로 수정
   - `ProfessorSignup.tsx`: import 경로 수정

4. **프로젝트 설정**
   - `package.json`에 `dev`, `build`, `preview` 스크립트 추가
   - `/src/main.tsx` 엔트리 파일 생성
   - `/index.html` 메인 HTML 파일 생성
   - `.gitignore` 파일 생성

## 🚀 로컬 실행 방법

### 1단계: 의존성 설치
```bash
npm install
```

### 2단계: 환경 변수 확인
`.env` 파일이 이미 생성되어 있습니다. Supabase 프로젝트 정보가 올바른지 확인하세요:

```env
VITE_SUPABASE_URL=https://hireyuxumqbilinyqhkw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3단계: 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 🧪 테스트 방법

### 데모 모드로 테스트 (서버 연동 없이)

1. 로그인 페이지 접속
2. 학생 또는 교수 역할 선택
3. **"데모 로그인"** 버튼 클릭
4. 대시보드 접근 가능

### 실제 회원가입/로그인 테스트 (Supabase 서버 필요)

**⚠️ 주의**: 실제 회원가입/로그인은 Supabase Edge Function이 배포되어야 작동합니다.

#### Supabase Edge Function 배포 방법:

1. Supabase CLI 설치
```bash
npm install -g supabase
```

2. Supabase 프로젝트에 로그인
```bash
supabase login
supabase link --project-ref hireyuxumqbilinyqhkw
```

3. Edge Function 배포
```bash
supabase functions deploy make-server-08576cb3
```

4. 환경 변수 설정 (Supabase Dashboard에서)
   - `SUPABASE_URL`: 프로젝트 URL
   - `SUPABASE_SERVICE_ROLE_KEY`: 서비스 역할 키
   - `SUPABASE_ANON_KEY`: Anon 키

## 📁 주요 파일 구조

```
/
├── .env                          # 환경 변수 (gitignore)
├── .env.example                  # 환경 변수 템플릿
├── index.html                    # HTML 엔트리
├── src/
│   ├── main.tsx                  # React 엔트리
│   ├── vite-env.d.ts             # Vite 환경 변수 타입 정의
│   ├── app/
│   │   ├── App.tsx               # 메인 앱
│   │   ├── routes.tsx            # 라우팅 설정
│   │   ├── lib/
│   │   │   └── supabase.ts       # Supabase 클라이언트
│   │   └── pages/
│   │       ├── Login.tsx         # 로그인 페이지
│   │       ├── student/
│   │       │   ├── StudentSignup.tsx
│   │       │   └── StudentDashboard.tsx
│   │       └── professor/
│   │           ├── ProfessorSignup.tsx
│   │           └── ProfessorDashboard.tsx
│   └── styles/                   # 스타일 파일
└── supabase/
    └── functions/
        └── server/
            └── index.tsx         # Edge Function (Hono 서버)
```

## 🐛 문제 해결

### 포트 충돌 오류
기본 포트(5173)가 사용 중이라면:
```bash
npm run dev -- --port 3000
```

### TypeScript 오류
```bash
npm run build
```
빌드를 실행하여 타입 오류를 확인하세요.

### Supabase 연결 오류
- `.env` 파일의 Supabase URL과 키가 올바른지 확인
- 브라우저 개발자 도구의 Network 탭에서 요청 확인
- Edge Function이 배포되어 있는지 확인

## 📝 다음 단계

### 실제 서버 연동을 위해:

1. **Supabase Edge Function 배포**
   - `/supabase/functions/server/index.tsx` 배포
   - 환경 변수 설정

2. **AWS Rekognition 설정** (얼굴 인식 기능)
   - AWS 계정 생성
   - Rekognition API 키 발급
   - Edge Function에 AWS 환경 변수 추가
   - 자세한 내용은 `/AWS_REKOGNITION_SETUP.md` 참조

3. **라즈베리파이 카메라 연동**
   - 카메라 모듈 설정
   - WebSocket 또는 RTSP 스트림 구현

## 💡 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# TypeScript 타입 체크
npx tsc --noEmit
```

## 🔐 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용
- 프론트엔드에서는 `VITE_SUPABASE_ANON_KEY`만 사용

## 📞 지원

문제가 발생하면 프로젝트 문서를 참조하거나 팀원에게 문의하세요.
