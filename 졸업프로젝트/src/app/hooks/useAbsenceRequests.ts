import { useState, useEffect } from "react";

export type AbsenceStatus = "대기" | "승인" | "거절";

export interface AbsenceRequest {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  reason: string;
  requestDate: string;
  status: AbsenceStatus;
  hasDocument: boolean;
  fileName?: string;
  rejectReason?: string;
}

const INITIAL_REQUESTS: AbsenceRequest[] = [
  {
    id: "1",
    studentName: "김철수",
    studentId: "20240101",
    course: "데이터베이스",
    date: "2026-03-10",
    reason: "병원 진료로 인해 수업에 참석하지 못했습니다. 진료 확인서를 첨부합니다.",
    requestDate: "2026-03-11",
    status: "대기",
    hasDocument: true,
    fileName: "진료확인서_20260310.pdf",
  },
  {
    id: "2",
    studentName: "이영희",
    studentId: "20240102",
    course: "알고리즘",
    date: "2026-03-05",
    reason: "가족 행사",
    requestDate: "2026-03-06",
    status: "대기",
    hasDocument: false,
  },
  {
    id: "3",
    studentName: "박민수",
    studentId: "20240103",
    course: "데이터베이스",
    date: "2026-03-08",
    reason: "코로나19 확진으로 자가격리 중이었습니다. 양성 확인서를 첨부합니다.",
    requestDate: "2026-03-08",
    status: "승인",
    hasDocument: true,
    fileName: "코로나19_양성확인서.pdf",
  },
  {
    id: "4",
    studentName: "최윤진",
    studentId: "20240104",
    course: "웹프로그래밍",
    date: "2026-02-28",
    reason: "단순 지각",
    requestDate: "2026-03-01",
    status: "거절",
    hasDocument: false,
    rejectReason: "정당한 공결 사유가 아님 (증빙 서류 없음)",
  }
];

export function useAbsenceRequests() {
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("absence_requests");
    if (saved) {
      setRequests(JSON.parse(saved));
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem("absence_requests", JSON.stringify(INITIAL_REQUESTS));
    }
  }, []);

  const addRequest = (newRequest: Omit<AbsenceRequest, "id" | "status" | "requestDate">) => {
    const request: AbsenceRequest = {
      ...newRequest,
      id: Math.random().toString(36).substr(2, 9),
      status: "대기",
      requestDate: new Date().toISOString().split("T")[0],
    };
    const updated = [request, ...requests];
    setRequests(updated);
    localStorage.setItem("absence_requests", JSON.stringify(updated));
  };

  const deleteRequest = (id: string) => {
    const updated = requests.filter(req => req.id !== id);
    setRequests(updated);
    localStorage.setItem("absence_requests", JSON.stringify(updated));
  };

  const updateStatus = (id: string, status: AbsenceStatus, rejectReason?: string) => {
    const updated = requests.map(req => 
      req.id === id ? { ...req, status, rejectReason } : req
    );
    setRequests(updated);
    localStorage.setItem("absence_requests", JSON.stringify(updated));
  };

  return {
    requests,
    addRequest,
    deleteRequest,
    updateStatus,
  };
}