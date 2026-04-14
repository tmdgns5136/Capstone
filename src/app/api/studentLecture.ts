import { api } from "./client";

// ── 타입 정의 ──

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
  message?: string;
}

// 1.12 내 강의 조회
export interface MyLectureData {
  lectureId: string;
  lectureName: string;
  professorName: string;
}

// 1.18 강의별 세션 목록
export interface SessionData {
  sessionId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

// 1-13 학기별 출결 통계
export interface StatsSessionData {
  sessionId: number;
  sessionNum: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: "ATTEND" | "ABSENCE" | "LATENESS" | "TBD";
}

export interface StatsData {
  totalSessions: number;
  attendance: number;
  absence: number;
  late: number;
  attendanceRate: number;
  sessions: StatsSessionData[];
}

// 1-14 강의 시간표
export interface LectureTimeTable {
  lectureCode: string;
  lectureName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

// 1.10 & 1.11 공통 응답
export interface AbsenceData {
  requestId: number;
  status: string; // "PENDING" | "APPROVED" | "REJECTED"
}

export interface AbsenceRequestData {
  requestId: number;
  title: string;
  status: string;
  requestDate: string;
}

export interface AbsenceDetailData {
  requestId: number;
  title: string;
  reason: string;
  status: string;
  requestData: string; // 신청일
  sessionId: number | null;
  evidenceFileUrl: string | null;
}

// ActionResponse (삭제용)
export interface ActionResponse {
  status: number;
  success: boolean;
  message: string;
  redirectUrl?: string;
}

// ── 1.12 내 강의 조회 ──

export async function getMyLectures(year: number, semester: string) {
  return api<ApiResponse<MyLectureData[]>>(
    `/api/mylecture?year=${year}&semester=${semester}`,
    { method: "GET" },
  );
}

// ── 1-13 학기별 출결 통계 ──

export async function getLectureStats(lectureId: string) {
  return api<ApiResponse<StatsData>>(
    `/api/mylecture/${lectureId}/stats`,
    { method: "GET" },
  );
}

// ── 1-14 강의 시간표 ──

export async function getLectureTimeTable(year: number, semester: string) {
  return api<ApiResponse<LectureTimeTable[]>>(
    `/api/mylecture/timetable?year=${year}&semester=${semester}`,
    { method: "GET" },
  );
}

// ── 1.18 강의별 세션 목록 조회 ──

export async function getLectureSessions(lectureId: string) {
  return api<ApiResponse<SessionData[]>>(
    `/api/mylecture/${lectureId}/sessions`,
    { method: "GET" },
  );
}

// ── 1.10 공결 신청 ──

export async function applyOfficialAbsence(
  lectureId: string,
  request: { sessionId: number; title: string; reason: string },
  evidenceFile: File,
) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  formData.append("evidenceFile", evidenceFile);

  return api<ApiResponse<AbsenceData>>(
    `/api/mylecture/${lectureId}/official-absence`,
    { method: "POST", body: formData },
  );
}

export async function getOfficialRequests(lectureId: string) {
  return api<ApiResponse<AbsenceRequestData[]>>(
    `/api/mylecture/${lectureId}/official-requests`,
    { method: "GET" },
  );
}

export async function getOfficialRequestDetail(
  lectureId: string,
  requestId: number,
) {
  return api<ApiResponse<AbsenceDetailData>>(
    `/api/mylecture/${lectureId}/official-requests/${requestId}`,
    { method: "GET" },
  );
}

export async function modifyOfficialRequest(
  lectureId: string,
  requestId: number,
  request: { sessionId?: number; title?: string; reason?: string },
  evidenceFile?: File,
) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  if (evidenceFile) {
    formData.append("evidenceFile", evidenceFile);
  }

  return api<ApiResponse<AbsenceData>>(
    `/api/mylecture/${lectureId}/official-requests/${requestId}/modify`,
    { method: "PATCH", body: formData },
  );
}

export async function deleteOfficialRequest(
  lectureId: string,
  requestId: number,
) {
  return api<ActionResponse>(
    `/api/mylecture/${lectureId}/official-requests/${requestId}/delete`,
    { method: "DELETE" },
  );
}

// ── 1.11 출결 이의 신청 ──

export async function applyObjectionAbsence(
  lectureId: string,
  request: { sessionId: number; title: string; reason: string },
  evidenceFile: File,
) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  formData.append("evidenceFile", evidenceFile);

  return api<ApiResponse<AbsenceData>>(
    `/api/mylecture/${lectureId}/objection-absence`,
    { method: "POST", body: formData },
  );
}

export async function getObjectionRequests(lectureId: string) {
  return api<ApiResponse<AbsenceRequestData[]>>(
    `/api/mylecture/${lectureId}/objection-requests`,
    { method: "GET" },
  );
}

export async function getObjectionRequestDetail(
  lectureId: string,
  requestId: number,
) {
  return api<ApiResponse<AbsenceDetailData>>(
    `/api/mylecture/${lectureId}/objection-requests/${requestId}`,
    { method: "GET" },
  );
}

export async function modifyObjectionRequest(
  lectureId: string,
  requestId: number,
  request: { sessionId?: number; title?: string; reason?: string },
  evidenceFile?: File,
) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  if (evidenceFile) {
    formData.append("evidenceFile", evidenceFile);
  }

  return api<ApiResponse<AbsenceData>>(
    `/api/mylecture/${lectureId}/objection-requests/${requestId}/modify`,
    { method: "PATCH", body: formData },
  );
}

export async function deleteObjectionRequest(
  lectureId: string,
  requestId: number,
) {
  return api<ActionResponse>(
    `/api/mylecture/${lectureId}/objection-requests/${requestId}/delete`,
    { method: "DELETE" },
  );
}