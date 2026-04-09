import { useState, useEffect, useCallback } from "react";
import { getAbsenceRequests, processAbsenceRequest, AbsenceRequest, AbsenceStatus } from "../api/absence";
import { toast } from "sonner";

export function useAbsenceRequests() {
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. 서버에서 목록 가져오기
  const fetchRequests = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getAbsenceRequests(page, 10);
      if (response.success) {
        // 백엔드 응답의 데이터 경로(data.data 또는 data.content)를 확인하세요.
        setRequests(response.data.data || []);
      }
    } catch (error) {
      toast.error("공결 신청 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // 3. 상태 업데이트 (Update)
  const updateStatus = async (absenceId: number, status: AbsenceStatus, rejectReason: string = "") => {
    try {
      const response = await processAbsenceRequest(absenceId, status, rejectReason);
      if (response.success) {
        toast.success("처리가 완료되었습니다.");
        await fetchRequests(); // 성공 후 목록 새로고침
        return true;
      }
    } catch (error) {
      toast.error("상태 변경에 실패했습니다.");
      return false;
    }
  };

  return {
    requests,
    loading,
    updateStatus,
    refresh: fetchRequests,
  };
}
