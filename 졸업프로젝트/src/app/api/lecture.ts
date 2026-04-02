import { api } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 4. 담당 강의 목록 타입
export interface Lecture {
  lectureId: string;
  name: string;
  schedule: string;
  room: string;
  students: number;
  status?: string;
}

// 5. 오늘 강의 일정 타입
export interface TodayLecture {
  lectureId: string;
  name: string;
  location: string;
  time: string;
  status: "WAIT" | "IN_PROGRESS" | "DONE" | string; 
}

// 6. 대시보드 통계 타입
export interface DashboardStats {
  totalStudents: number;
  avgAttendance: number;
  pendingAbsences: number;
  todayClasses: number;
}

//API 함수

// 4. 담당 강의 목록 조회
export async function getLectures() {
  return api<ApiResponse<Lecture[]>>("/api/professors/lectures", {
    method: "GET",
  });
}

// 5. 오늘 강의 일정 조회
export async function getTodayLectures() {
  return api<ApiResponse<TodayLecture[]>>("/api/professors/lectures/today", {
    method: "GET",
  });
}

// 6. 대시보드 통계 조회
export async function getDashboardStats() {
  return api<ApiResponse<DashboardStats>>("/api/professors/dashboard", {
    method: "GET",
  });
}

// 7. 수업 시작
export async function startLecture(lectureId: string) {
  return api<ApiResponse<any>>(`/api/professors/lectures/${lectureId}/start`, {
    method: "POST",
  });
}

// 7-1. 수업 종료
export async function endLecture(lectureId: string) {
  return api<ApiResponse<any>>(`/api/professors/lectures/${lectureId}/end`, {
    method: "POST",
  });
}