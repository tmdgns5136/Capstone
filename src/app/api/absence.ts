import { api } from "./client";
import { ApiResponse, PaginatedData } from "./lecture";

export type AbsenceStatus = "PENDING" | "APPROVED" | "REJECTED"; // WAIT 대신 PENDING

export interface AbsenceRequest {
  officialId: number;       // absenceId에서 변경
  studentId: string;
  studentName: string;
  course: string;
  sessionId: number | null; // 추가
  date: string;
  reason: string;
  status: AbsenceStatus;
  fileName: string;         // 백엔드에서 필드명 확인됨
  rejectReason?: string;
  // requestDate, hasDocument는 백엔드 응답에 없으므로 필요 시 추가 확인
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
  officialId: number, 
  status: AbsenceStatus,
  rejectReason: string = ""
) {
  return api<ApiResponse<any>>(`/api/professors/absences/${officialId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectReason }),
  });
}

// 10-2. 공결 증빙서류 다운로드 (Blob 처리)
export async function downloadAbsenceDocument(officialId: number) {
  return api<Blob>(`/api/professors/absences/${officialId}/document`, {
    method: "GET",
    // 주의: client.ts의 api 함수가 blob 응답을 처리할 수 있어야 합니다.
  });
}