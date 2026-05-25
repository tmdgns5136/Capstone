import { api } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Notice {
    noticeId: string;
    title: string;
    content: string;
    createdDate: string;
    views: number;
    comments: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalElements: number;
  totalPages: number;
}

export async function createNotice(lectureId: string, title: string, content: string, file?: File) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (file) formData.append("file", file);

  return api<ApiResponse<any>>(`/api/professors/lectures/${lectureId}/notices`, {
    method: "POST",
    body: formData,
  });
}

export async function getNoticeList(lectureId: string, page = 1, size = 10) {
  return api<PaginatedResponse<Notice>>(
    `/api/professors/lectures/${lectureId}/notices?page=${page}&size=${size}`,
    { method: "GET" }
  );
}