# 백엔드-프론트 API 연동 점검

> 점검일: 2026-05-12
> 백엔드 경로: `C:\Users\User\Desktop\Capstone-Jeongtaek`
> 수정 완료 시 각 항목의 `[ ]`를 `[x]`로 변경하고 완료 날짜를 기입할 것

---

## 심각 (버그 가능성)

### 1. 페이징 0-based vs 1-based 불일치
- [ ] **미완료**
- **프론트 위치:**
  - `src/app/api/absence.ts` (21번 줄) — `page: number = 1`
  - `src/app/api/appeal.ts` (19번 줄) — `page: number = 1`
  - `src/app/api/notice.ts` (35번 줄) — `page = 1`
  - `src/app/api/qna.ts` (33번 줄) — `page = 1`
- **백엔드:** `@PageableDefault(page = 0)` — 0-based 페이징
- **증상:** 첫 페이지 요청 시 실제로는 두 번째 페이지 데이터를 가져올 수 있음
- **수정 방안:**
  - (A) 프론트에서 API 호출 시 `page - 1`로 변환 후 전송
  - (B) 백엔드에서 1-based로 보정 (이미 되어있는지 승헌님 확인 필요)
- **완료일:**

### 2. 공지사항 생성 파라미터 형식 불일치
- [ ] **미완료**
- **프론트 위치:** `src/app/api/notice.ts` (23~32번 줄)
- **내용:** 프론트에서 `FormData`로 title, content를 전송
- **백엔드:** `@RequestParam("title")`, `@RequestParam("content")` — Query String 기대
- **수정 방안:**
  - (A) 프론트를 JSON body 방식으로 변경 + 백엔드 `@RequestBody`로 변경
  - (B) 프론트에서 Query String으로 전송 (`?title=...&content=...`)
  - (C) 현재 동작 확인 후 결정 (Spring이 FormData도 @RequestParam으로 받을 수 있음)
- **완료일:**

### 3. 공결/이의 신청 응답 구조 확인 필요
- [ ] **미완료**
- **프론트 위치:**
  - `src/app/hooks/useAbsenceRequests.ts` (14~16번 줄) — `response.data.data`로 접근
  - `src/app/hooks/useAppealRequests.ts` — 동일 패턴
- **백엔드:** `ApiResponse<OfficialListResponse>` 또는 `ApiResponse<ObjectionListResponse>` 반환
- **내용:** 프론트가 `response.data.data`로 접근하는데, 실제 백엔드 DTO 중첩 구조 확인 필요
- **수정 방안:** 백엔드 응답 실제 JSON 구조를 Postman 등으로 확인 후 프론트 접근 경로 수정
- **완료일:**

---

## 중간 (동작하지만 개선 필요)

### 4. Q&A 답변 수정 파라미터명 불일치
- [ ] **미완료**
- **프론트 위치:** `src/app/api/qna.ts` (57번 줄)
- **내용:** 프론트에서 `answerId`라는 이름 사용, 백엔드는 `questionId`로 PathVariable 정의
- **백엔드:** `@PatchMapping("/answers/{questionId}")`
- **영향:** 값 자체는 같은 ID를 전달하므로 동작하지만, 의미적 혼동 가능
- **수정 방안:** 프론트 파라미터명을 `questionId`로 통일
- **완료일:**

### 5. 알림 응답 필드명 중복 정의
- [ ] **미완료**
- **프론트 위치:** `src/app/api/notification.ts` (10~11번 줄)
- **내용:** `read: boolean`과 `isRead?: boolean` 둘 다 정의되어 있음
- **수정 방안:** 백엔드 실제 응답 필드명 확인 후 하나로 통일
- **완료일:**

### 6. lectureId 타입 string vs Long
- [ ] **미완료**
- **프론트 위치:** `src/app/api/qna.ts`, `src/app/api/lecture.ts` 등 여러 파일
- **내용:** 프론트에서 `lectureId: string`으로 정의, 백엔드는 `Long` 타입
- **영향:** URL에 문자열로 들어가면 자동 변환되므로 동작하지만 타입 안전성 부족
- **수정 방안:** 프론트 타입을 `number`로 통일하고 호출부 정리
- **완료일:**

---

## 참고 (확인 완료, 정상)

| 영역 | 상태 |
|------|------|
| 로그인 / 회원가입 / 로그아웃 | 일치 |
| 토큰 재발급 (refresh) | 일치 |
| 이메일 인증 (발송/확인) | 일치 |
| 비밀번호 찾기/변경 | 일치 |
| 강의 CRUD (관리자) | 일치 |
| 학생/교수 관리 (관리자) | 일치 |
| 사진 변경 요청 관리 (관리자) | 일치 |
| 교수 강의 목록/대시보드 | 일치 |
| 수업 시작/종료 | 일치 |
| 출석 상태 수동 변경 | 일치 |
| 출결 모니터링 데이터 | 일치 |
| 학생 강의 목록/시간표/통계 | 일치 |
| 공결/이의 신청 (학생) | 일치 |
| Q&A 질문 등록/삭제 (학생) | 일치 |
| 프로필 조회/수정/탈퇴 | 일치 |
| 알림 조회/읽기 | 일치 |

---

## 진행 현황

| 구분 | 전체 | 완료 | 미완료 |
|------|------|------|--------|
| 심각 | 3 | 0 | 3 |
| 중간 | 3 | 0 | 3 |
| **합계** | **6** | **0** | **6** |
