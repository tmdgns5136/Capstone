import { api } from "./client";
import { ApiResponse } from "./lecture";

export type status = "ATTEND" | "LATENESS" | "ABSENCE" | "TBD";

export interface UpdateAttendancePayload {
  studentId: string;
  lectureId: string;
  status: "ATTEND" | "LATENESS" | "ABSENCE" | "TBD";
  date: string;
  sessionNum?: number; 
}

export interface StudentAttendanceDetail {
  studentId: string;
  name: string;
  status?: status;
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number;
}

export interface AttendanceMonitoringData {
  attendance: number;
  late: number; 
  absent: number;
  students: StudentAttendanceDetail[];
}

export async function getLectureSessions(lectureId: string, date: string) {
  const res = await fetch(`/api/lectures/${lectureId}/sessions?date=${date}`);
  return res.json();
}

// 8. 학생 출석 상태 수동 변경
export async function updateAttendance(payload: UpdateAttendancePayload) {
  // [체크] 백엔드에서 주소가 /api/professors/attendance 가 맞는지 확인해주세요!
  return api<ApiResponse<{ redirectUrl: string }>>("/api/professors/attendance", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 9. 출결 모니터링 데이터 조회 (404 해결용)
export async function getAttendanceMonitoring(
  lectureId: string, 
  // 🌟 [수정 1] 파라미터 타입에 semester?: string 추가
  params: { date?: string; sessionNum?: number; semester?: string } 
) {
  // 🌟 [수정 2] 하드코딩된 '2026-1학기'를 지우고, 넘어온 params.semester 값을 사용하도록 변경
  let url = `/api/professors/lectures/${lectureId}/attendance?semester=${params.semester || '2026-1학기'}`;
  
  if (params.date) url += `&date=${params.date}`;
  if (params.sessionNum) url += `&sessionNum=${params.sessionNum}`; 
  
  return api<any>(url, { method: "GET" });
}