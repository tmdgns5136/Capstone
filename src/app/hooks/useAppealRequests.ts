import { useState, useEffect, useCallback } from "react";
// api/appeal.ts에서 정의한 함수와 타입을 가져옵니다.
import { getAppeals, processAppeal, AppealRequest, AppealStatus } from "../api/appeal";
import { toast } from "sonner";

export function useAppealRequests() {
  const [requests, setRequests] = useState<AppealRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 서버에서 이의 신청 목록 가져오기 (Read)
  const fetchAppeals = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getAppeals(page, 10);
      if (response.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      toast.error("이의 신청 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 처음 마운트될 때 데이터 로드
  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  // 2. 이의 신청 처리 (Update - 승인/반려)
  const updateStatus = async (appealId: number, status: AppealStatus, rejectReason: string = "") => {
    try {
      const response = await processAppeal(appealId, status, rejectReason);
      if (response.success) {
        toast.success("처리가 완료되었습니다.");
        await fetchAppeals(); // 목록 새로고침
        return true;
      }
    } catch (error) {
      toast.error("상태 변경에 실패했습니다.");
      return false;
    }
  };

  return {
    requests,      // 서버에서 가져온 실제 데이터
    loading,
    updateStatus,  // 교수용 처리 함수
    refresh: fetchAppeals,
  };
}