import { api } from "./client";
import { PaginatedResponse } from "./notice";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface QuestionSummary {
  questionId: number;
  studentNum: string;
  title: string;
  isPrivate: boolean;
  isAnswered: boolean;
  createdDate: string;
}

export interface QuestionDetail {
  questionId: number;
  title: string;
  content: string;
  isPrivate: boolean;
  createdDate: string;
  views: number;
  answer?: {
    content: string;
    professorName: string;
    answeredDate: string;
  };
}
// 13. Q&A 질문 목록 조회
export async function getQuestionList(lectureId: string, page = 1, size = 10) {
  return api<PaginatedResponse<QuestionSummary>>(
    `/api/professors/lectures/${lectureId}/questions?page=${page}&size=${size}`,
    { method: "GET" }
  );
}

// 13-1. Q&A 질문 상세 조회
export async function getQuestionDetail(lectureId: string, questionId: number) {
  return api<ApiResponse<QuestionDetail>>(
    `/api/professors/lectures/${lectureId}/questions/${questionId}`,
    { method: "GET" }
  );
}

// 13-2. Q&A 답변 등록
export async function createAnswer(questionId: number, content: string) {
  return api<ApiResponse<any>>(`/api/professors/questions/${questionId}/answer`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// 13-3. Q&A 답변 수정
export async function updateAnswer(answerId: number, content: string) {
  return api<ApiResponse<any>>(`/api/professors/answers/${answerId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

// 13-4. Q&A 답변 삭제
export async function deleteAnswer(answerId: number) {
  return api<ApiResponse<any>>(`/api/professors/answers/${answerId}`, {
    method: "DELETE",
  });
}