import { useState, useEffect } from "react";

export type PhotoRequestStatus = "대기" | "승인" | "거절";

export interface PhotoRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  photos: {
    front: string;
    left: string;
    right: string;
  };
  requestDate: string;
  status: PhotoRequestStatus;
  rejectReason?: string;
}

const INITIAL_REQUESTS: PhotoRequest[] = [
  {
    id: "pr1",
    studentId: "20240101",
    studentName: "김철수",
    department: "컴퓨터공학과",
    photos: {
      front: "/mypage/마이페이지 정면.png",
      left: "/mypage/마이페이지 좌측.png",
      right: "/mypage/마이페이지 우측.png",
    },
    requestDate: "2026-03-20 14:23:15",
    status: "대기",
  },
  {
    id: "pr2",
    studentId: "20240102",
    studentName: "이영희",
    department: "컴퓨터공학과",
    photos: {
      front: "/mypage/마이페이지 정면.png",
      left: "/mypage/마이페이지 좌측.png",
      right: "/mypage/마이페이지 우측.png",
    },
    requestDate: "2026-03-18 09:47:32",
    status: "대기",
  },
  {
    id: "pr3",
    studentId: "20240103",
    studentName: "박민수",
    department: "전자공학과",
    photos: {
      front: "/mypage/마이페이지 정면.png",
      left: "/mypage/마이페이지 좌측.png",
      right: "/mypage/마이페이지 우측.png",
    },
    requestDate: "2026-03-15 11:05:48",
    status: "승인",
  },
  {
    id: "pr4",
    studentId: "20240104",
    studentName: "정수진",
    department: "기계공학과",
    photos: {
      front: "/mypage/마이페이지 정면.png",
      left: "/mypage/마이페이지 좌측.png",
      right: "/mypage/마이페이지 우측.png",
    },
    requestDate: "2026-03-12 16:30:22",
    status: "거절",
    rejectReason: "사진이 불선명하여 얼굴 인식이 불가합니다. 밝은 조명에서 다시 촬영해주세요.",
  },
];

export function usePhotoRequests() {
  const [requests, setRequests] = useState<PhotoRequest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("photo_requests");
    if (saved) {
      const parsed: PhotoRequest[] = JSON.parse(saved);
      const hasOldFormat = parsed.some(r => !r.requestDate || !r.requestDate.includes(" "));
      if (hasOldFormat) {
        setRequests(INITIAL_REQUESTS);
        localStorage.setItem("photo_requests", JSON.stringify(INITIAL_REQUESTS));
      } else {
        setRequests(parsed);
      }
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem("photo_requests", JSON.stringify(INITIAL_REQUESTS));
    }
  }, []);

  const addRequest = (newRequest: Omit<PhotoRequest, "id" | "status" | "requestDate">) => {
    const request: PhotoRequest = {
      ...newRequest,
      id: Math.random().toString(36).substr(2, 9),
      status: "대기",
      requestDate: (() => { const now = new Date(); const d = now.toISOString().split("T")[0]; const t = now.toTimeString().split(" ")[0]; return `${d} ${t}`; })(),
    };
    const saved = localStorage.getItem("photo_requests");
    const current: PhotoRequest[] = saved ? JSON.parse(saved) : [];
    const updated = [request, ...current];
    try {
      localStorage.setItem("photo_requests", JSON.stringify(updated));
      setRequests(updated);
    } catch {
      throw new Error("storage_full");
    }
  };

  const updateStatus = (id: string, status: PhotoRequestStatus, rejectReason?: string) => {
    const updated = requests.map(req =>
      req.id === id ? { ...req, status, rejectReason } : req
    );
    setRequests(updated);
    localStorage.setItem("photo_requests", JSON.stringify(updated));
  };

  const deleteRequest = (id: string) => {
    const updated = requests.filter(req => req.id !== id);
    setRequests(updated);
    localStorage.setItem("photo_requests", JSON.stringify(updated));
  };

  return {
    requests,
    addRequest,
    updateStatus,
    deleteRequest,
  };
}
