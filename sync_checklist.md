# Capstone → Capstone-yohan-front 동기화 체크리스트

> Capstone(현재 작업 폴더)의 변경사항을 Capstone-yohan-front에 적용하기 위한 목록
> 기준일: 2026-05-18

---

## 큰 차이 (전체 재작성 수준 — 파일 통째로 복사 권장)

- [x] `pages/student/StudentStats.tsx` — 출결 통계 전면 개편
- [x] `pages/student/StudentSignup.tsx` — 회원가입 전면 개편
- [x] `api/studentLecture.ts` — 학생 강의 API 전면 변경
- [x] `pages/student/StudentCourseDetail.tsx` — 강의 상세 전면 변경
- [x] `pages/PasswordReset.tsx` — 비밀번호 찾기 전면 변경
- [x] `pages/professor/ProfessorClassControl.tsx` — 수업 제어 전면 변경
- [x] `pages/student/StudentProfile.tsx` — 마이페이지 전면 변경 (학과 제거, 전화번호 배치, 얼굴인식 등)
- [x] `pages/shared/NotificationsPage.tsx` — 동일 (변경 불필요)
- [x] `pages/student/StudentHome.tsx` — 학생 대시보드 홈 전면 변경
- [x] `pages/Login.tsx` — 로그인 페이지 전면 변경
- [x] `pages/admin/AdminDeviceManagement.tsx` — yohan-front 버전 유지 (실제 API 연동됨)
- [x] `pages/admin/AdminHome.tsx` — yohan-front 버전 유지 (실제 API 연동됨)
- [x] `hooks/useClassSimulator.tsx` — yohan-front 버전 유지 (실제 API 연동됨)
- [x] `pages/student/StudentCourses.tsx` — 강의 목록 대폭 변경
- [x] `pages/professor/ProfessorProfile.tsx` — 교수 마이페이지 대폭 변경

---

## 중간 차이 (부분 수정 필요)

- [x] `pages/admin/AdminCourseManagement.tsx` — 다중 요일→단일 요일, 시간 UI에 ~ 추가
- [x] `pages/student/StudentCourseStats.tsx` — 강의별 출결 통계 개선
- [x] `pages/student/StudentTimetable.tsx` — 시간표 개선
- [x] `pages/professor/ProfessorCourseQA.tsx` — Q&A 개선
- [x] `pages/professor/ProfessorHome.tsx` — yohan-front 버전 유지 (실제 API 연동됨)
- [x] `components/FormModal.tsx` — 폼 모달 컴포넌트 변경
- [x] `constants/semester.ts` — 학기 상수 변경

---

## 작은 차이 (간단 패치)

- [x] `components/NotificationBell.tsx` — 알림 클릭 시 라우팅 개선 (admin→photo-requests, mapRedirectUrl 추가)
- [x] `pages/admin/AdminProfessorManagement.tsx`
- [x] `pages/professor/ProfessorSignup.tsx`
- [x] `pages/admin/AdminStudentManagement.tsx`
- [x] `pages/admin/AdminStudentTable.tsx`
- [x] `pages/professor/ProfessorAbsenceManagement.tsx`
- [x] `pages/professor/ProfessorCourses.tsx` — yohan-front 버전 유지 (에러 UI 있음)
- [x] `hooks/useAuth.ts`
- [x] `pages/professor/ProfessorAttendanceEdit.tsx`
- [x] `pages/professor/ProfessorCourseAttendance.tsx`
- [x] `pages/professor/ProfessorCourseDetail.tsx`
- [x] `pages/professor/ProfessorAppealManagement.tsx`
- [x] `api/attendance.ts`
- [x] `api/auth.ts`
- [x] `pages/student/StudentDashboard.tsx` — userDepartment 하드코딩 제거
- [x] `pages/student/StudentAbsenceRequest.tsx`
- [x] `pages/student/StudentCourseDetailPage.tsx`

---

## 파일 추가/삭제

- [x] `hooks/useRaspberryPiSimulator.ts` → 불필요 (useClassSimulator가 대체)
- [x] `utils/` 폴더 전체 → yohan-front에 복사
- [x] `api/adminDevice.ts` — yohan-front에만 있음 (유지, AdminHome/AdminDeviceManagement에서 사용)

---

## 작업 순서 권장

1. ~~**파일 추가/삭제** 먼저 처리 (의존성)~~
2. ~~**API 파일** (`studentLecture.ts`, `attendance.ts`, `auth.ts`, `constants/semester.ts`)~~
3. ~~**hooks** (`useAuth.ts`)~~
4. ~~**components** (`NotificationBell.tsx`)~~
5. ~~**학생 페이지** (큰 파일부터)~~
6. ~~**교수 페이지**~~
7. ~~**관리자 페이지**~~
8. ~~**공통 페이지** (`NotificationsPage`)~~
9. ~~빌드 확인 (`npm run build`)~~ ✅ 전체 빌드 성공 (2026-05-18)

---

## 참고

- 모든 경로는 `src/app/` 기준
- "큰 차이" 파일들은 diff 적용보다 통째로 복사가 빠름
- 복사 후 import 경로나 의존성 깨지는 부분 확인 필요
- `utils/format.ts` 등 새로 추가된 유틸은 다른 파일에서 import하고 있으므로 먼저 복사해야 함
- 빌드 확인 완료: 전체 동기화 후 `npm run build` 성공 (2026-05-18)
