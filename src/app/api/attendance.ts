import { api } from "./client";
import { ApiResponse } from "./lecture";

export interface UpdateAttendancePayload {
  studentId: string;
  lectureId: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
}

export interface StudentAttendanceDetail {
  studentId: string;
  name: string;
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


// 학생 출석 상태 수동 변경 (결석 -> 출석 등)
export async function updateAttendance(payload: UpdateAttendancePayload) {
  return api<ApiResponse<{ redirectUrl: string }>>("/api/professors/attendance", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 출결 모니터링 데이터 조회
export async function getAttendanceMonitoring(lectureId: string, semester: string = "2026-1") {
  return api<ApiResponse<AttendanceMonitoringData>>( `/api/professors/lectures/${lectureId}/attendance?semester=${semester}`, {
      method: "GET",
    });
}