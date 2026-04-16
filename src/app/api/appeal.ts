import { api } from "./client";
import { ApiResponse, PaginatedData } from "./lecture";

export type AppealStatus = "WAIT" | "APPROVED" | "REJECTED";

// 11. 이의 신청 데이터 타입
export interface AppealRequest {
  appealId: string;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  reason: string;
  requestDate: string;
  status: AppealStatus;
  rejectReason?: string;
}

// 11. 이의 신청 목록 조회
export async function getAppeals(page: number = 1, size: number = 10) {
  return api<ApiResponse<PaginatedData<AppealRequest>>>(
    `/api/professors/appeals?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}

// 11-1. 이의 신청 처리 (승인/반려)
export async function processAppeal(
  appealId: string,
  status: AppealStatus,
  rejectReason: string = ""
) {
  return api<ApiResponse<any>>(`/api/professors/appeals/${appealId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectReason }),
  });
}