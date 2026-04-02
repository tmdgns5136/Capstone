import { api } from "./client";
import { ApiResponse } from "./lecture";

export interface AttendanceRecord {
  studentNum: string;
  studentName: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  checkTime?: string;
}

// 특정 강의의 출석 명단 조회
export async function getAttendanceList(lectureId: string) {
  return api<ApiResponse<AttendanceRecord[]>>(`/api/professors/lectures/${lectureId}/attendance`, {
    method: "GET",
  });
}

// 학생 출석 상태 수동 변경 (결석 -> 출석 등)
export async function updateAttendanceStatus(lectureId: string, studentNum: string, status: string) {
  return api(`/api/professors/lectures/${lectureId}/attendance/${studentNum}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}