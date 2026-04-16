import { api } from "./client";
import { ApiResponse } from "./lecture";

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED" | "TBD";

export interface UpdateAttendancePayload {
  studentId: string;
  lectureId: string;
  status: AttendanceStatus;
  date: string;
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
  params: { date?: string; semester?: string } = {}
) {
  const semester = params.semester || "2026-1";
  
  // [수정] URL을 더 명확하게 조립합니다. 
  // lectureId가 undefined면 여기서 바로 티가 납니다.
  let url = `/api/professors/lectures/${lectureId}/attendance?semester=${semester}`;
  
  if (params.date) {
    url += `&date=${params.date}`;
  }

  // 브라우저 F12 콘솔에 찍히는 이 주소를 꼭 확인해보세요!
  console.log("🚀 출결 요청 최종 주소:", url);

  return api<ApiResponse<AttendanceMonitoringData>>(url, { 
    method: "GET" 
  });
}