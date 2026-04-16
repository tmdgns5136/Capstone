import { api } from "./client";
import { ApiResponse, PaginatedData } from "./lecture";

export type AppealStatus = "PENDING" | "APPROVED" | "REJECTED"; // WAIT 대신 PENDING

export interface AppealRequest {
  objectionId: number;      // appealId에서 변경 및 타입 변경
  studentId: string;
  studentName: string;
  course: string;
  sessionId: number;        // 추가
  date: string;
  reason: string;
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
  objectionId: number, 
  status: AppealStatus,
  rejectReason: string = ""
) {
  return api<ApiResponse<any>>(`/api/professors/appeals/${objectionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectReason }),
  });
}