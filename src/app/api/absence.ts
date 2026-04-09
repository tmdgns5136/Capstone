import { api } from "./client";
import { ApiResponse, PaginatedData } from "./lecture";

export type AbsenceStatus = "WAIT" | "APPROVED" | "REJECTED";

// 10. 공결 신청 데이터 타입
export interface AbsenceRequest {
  absenceId: number;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  reason: string;
  requestDate: string;
  status: AbsenceStatus;
  hasDocument: boolean;
  fileName: string;
  rejectReason?: string;
}

// 10. 공결 신청 목록 조회
export async function getAbsenceRequests(page: number = 1, size: number = 10) {
  return api<ApiResponse<PaginatedData<AbsenceRequest>>>(
    `/api/professors/absences?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}

// 10-1. 공결 신청 처리 (승인/반려)
export async function processAbsenceRequest(
  absenceId: number, 
  status: AbsenceStatus,
  rejectReason: string = ""
) {
  return api<ApiResponse<any>>(`/api/professors/absences/${absenceId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectReason }),
  });
}

// 10-2. 공결 증빙서류 다운로드 (Blob 처리)
export async function downloadAbsenceDocument(absenceId: number) {
  return api<Blob>(`/api/professors/absences/${absenceId}/document`, {
    method: "GET",
    // 주의: client.ts의 api 함수가 blob 응답을 처리할 수 있어야 합니다.
  });
}