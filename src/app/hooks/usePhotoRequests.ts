import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "../api/client";

export interface PhotoItem {
  orientation: string;
  url: string;
}

export interface PhotoRequest {
  requestId: string;
  studentId: number;
  studentNum: string;
  studentName: string;
  requestDate: string;
  status: string;
  photos: PhotoItem[];
}

export interface PhotoCompleteItem {
  studentName: string;
  studentNum: string;
  accessDate: string;
  status: string;
  rejectReason: string | null;
}

export interface PhotoDetailData {
  requestId: string;
  studentId: number;
  studentNum: string;
  studentName: string;
  requestDate: string;
  status: string;
  currentPhotos: PhotoItem[];
  requestedPhotos: PhotoItem[];
}

interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function usePhotoRequests() {
  const [pendingRequests, setPendingRequests] = useState<PhotoRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<PhotoCompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [completedTotal, setCompletedTotal] = useState(0);

  const fetchPending = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await api<any>(`/api/admin/photo-requests/pending?page=${page}&size=30`);
      const pageData: PageData<PhotoRequest> = res.data;
      setPendingRequests(pageData.content);
      setPendingTotal(pageData.totalElements);
    } catch {
      toast.error("대기 중인 사진 요청을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompleted = useCallback(async (page = 0) => {
    try {
      const res = await api<any>(`/api/admin/photo-requests/not-pending?page=${page}&size=30`);
      const pageData: PageData<PhotoCompleteItem> = res.data;
      setCompletedRequests(pageData.content);
      setCompletedTotal(pageData.totalElements);
    } catch {
      toast.error("처리된 사진 요청을 불러오지 못했습니다.");
    }
  }, []);

  const fetchDetail = useCallback(async (requestId: string): Promise<PhotoDetailData | null> => {
    try {
      const res = await api<any>(`/api/admin/photo-requests/${requestId}`);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  const approve = useCallback(async (requestId: string, approvalStatus: string, rejectReason?: string) => {
    await api(`/api/admin/photo-requests/${requestId}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus, rejectReason: rejectReason || "" }),
    });
  }, []);

  useEffect(() => {
    fetchPending();
    fetchCompleted();
  }, [fetchPending, fetchCompleted]);

  return {
    pendingRequests,
    completedRequests,
    loading,
    pendingTotal,
    completedTotal,
    fetchPending,
    fetchCompleted,
    fetchDetail,
    approve,
  };
}
