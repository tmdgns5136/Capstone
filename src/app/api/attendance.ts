import { api } from "./client";
import { ApiResponse } from "./lecture";

export type AttendanceStatus = "ATTENDANCE" | "LATE" | "ABSENT" | "EXCUSED" | "TBD";

export interface UpdateAttendancePayload {
  studentId: string;
  lectureId: string;
  status: AttendanceStatus;
}

export interface StudentAttendanceDetail {
  studentId: string;
  name: string;
  status?: AttendanceStatus;
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


// 8. 학생 출석 상태 수동 변경 (결석 -> 출석 등)
export async function updateAttendance(payload: UpdateAttendancePayload) {
  return api<ApiResponse<{ redirectUrl: string }>>("/api/professors/attendance", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 9. 출결 모니터링 데이터 조회
export async function getAttendanceMonitoring(
  lectureId: string, 
  params: { date?: string; semester?: string } = { semester: "2026-1" }
) {
  const queryString = params.date 
    ? `date=${params.date}` 
    : `semester=${params.semester}`;

  return api<ApiResponse<AttendanceMonitoringData>>(
    `/api/professors/lectures/${lectureId}/attendance?${queryString}`,
    { method: "GET" }
  );
}