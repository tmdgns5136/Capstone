import { api } from "./client";
import { ApiResponse, PaginatedData } from "./lecture";

export type AppealStatus = "PENDING" | "APPROVED" | "REJECTED"; // WAIT 대신 PENDING

export interface AppealRequest {
  objectionId: number;      // appealId에서 변경 및 타입 변경
  studentId: string;
  studentName: string;
  course: string;
  sessionId: number;        // 추가
  sessionNum?: number;      // 교시 번호
  date: string;
  reason: string;
  status: AppealStatus;
  rejectReason?: string;
  fileName?: string;
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

export async function downloadAppealDocument(objectionId: number): Promise<Blob> {
  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken") || "";

  const response = await fetch(`/api/professors/appeals/${objectionId}/document`, {
    method: "GET",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
      "Accept": "*/*"
    }
  });

  if (!response.ok) {
    throw new Error("서버로부터 이의신청 증빙 서류를 읽어오지 못했습니다.");
  }

  return await response.blob();
}