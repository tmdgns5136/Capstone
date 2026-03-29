import { useState, useEffect } from "react";

export type AppealStatus = "대기" | "승인" | "거절";

export interface AppealRequest {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  reason: string;
  requestDate: string;
  status: AppealStatus;
  rejectReason?: string;
}

const INITIAL_REQUESTS: AppealRequest[] = [
  {
    id: "a1",
    studentName: "강신우",
    studentId: "20240201",
    course: "알고리즘",
    date: "2026-03-18",
    reason: "수업에 참석하여 자리에 앉아 있었으나, 얼굴 인식 단말기가 정상적으로 인식하지 못했습니다. 주변 학생들이 출석을 확인할 수 있습니다.",
    requestDate: "2026-03-18",
    status: "대기",
  },
  {
    id: "a2",
    studentName: "박지민",
    studentId: "20240205",
    course: "데이터 시각화",
    date: "2026-03-15",
    reason: "마스크를 착용한 상태로 인식을 시도했으나 실패했습니다. 수업 시작 전에 교실에 도착해 있었습니다.",
    requestDate: "2026-03-15",
    status: "대기",
  },
  {
    id: "a3",
    studentName: "이수현",
    studentId: "20240210",
    course: "인터페이스 디자인",
    date: "2026-03-12",
    reason: "단말기 오류로 인식이 되지 않았습니다. 교수님께 구두로 출석 확인을 받았습니다.",
    requestDate: "2026-03-12",
    status: "승인",
  },
  {
    id: "a4",
    studentName: "정하늘",
    studentId: "20240215",
    course: "창의적 사고",
    date: "2026-03-10",
    reason: "출석 인식이 안 되었다고 주장하나, 해당 시간에 출입 기록이 없습니다.",
    requestDate: "2026-03-11",
    status: "거절",
    rejectReason: "출입 기록 확인 결과 해당 시간에 건물 출입 내역이 없음",
  },
];

export function useAppealRequests() {
  const [requests, setRequests] = useState<AppealRequest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("appeal_requests");
    if (saved) {
      setRequests(JSON.parse(saved));
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem("appeal_requests", JSON.stringify(INITIAL_REQUESTS));
    }
  }, []);

  const addRequest = (newRequest: Omit<AppealRequest, "id" | "status" | "requestDate">) => {
    const request: AppealRequest = {
      ...newRequest,
      id: Math.random().toString(36).substr(2, 9),
      status: "대기",
      requestDate: new Date().toISOString().split("T")[0],
    };
    const updated = [request, ...requests];
    setRequests(updated);
    localStorage.setItem("appeal_requests", JSON.stringify(updated));
  };

  const updateStatus = (id: string, status: AppealStatus, rejectReason?: string) => {
    const updated = requests.map(req =>
      req.id === id ? { ...req, status, rejectReason } : req
    );
    setRequests(updated);
    localStorage.setItem("appeal_requests", JSON.stringify(updated));
  };

  const deleteRequest = (id: string) => {
    const updated = requests.filter(req => req.id !== id);
    setRequests(updated);
    localStorage.setItem("appeal_requests", JSON.stringify(updated));
  };

  return {
    requests,
    addRequest,
    updateStatus,
    deleteRequest,
  };
}
