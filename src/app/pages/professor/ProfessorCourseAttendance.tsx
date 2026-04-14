import { useState, useEffect, useCallback } from "react";
import { Save, RotateCcw, Check, AlarmClock, X, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
// API 함수 가져오기
import { getAttendanceMonitoring, updateAttendance, AttendanceStatus } from "../../api/attendance";

// 1. 상태값 매핑 (UI용 <-> API용)
const API_STATUS_MAP: Record<string, AttendanceStatus> = {
  "출석": "ATTENDANCE",
  "지각": "LATE",
  "결석": "ABSENT",
  "공결": "EXCUSED"
};

const UI_STATUS_MAP: Record<AttendanceStatus, string> = {
  ATTENDANCE: "출석",
  LATE: "지각",
  ABSENT: "결석",
  EXCUSED: "공결"
};

export function ProfessorCourseAttendance({ lectureId }: { lectureId: string }) {
  // --- 상태 관리 ---
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [baseStudents, setBaseStudents] = useState<any[]>([]); // 원본 데이터 (되돌리기용)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingChanges, setPendingChanges] = useState<Record<string, AttendanceStatus>>({});

  // --- 데이터 페칭 (9번 명세 활용) --
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      // 주차/세션 선택 시 해당 날짜로 호출
      const response = await getAttendanceMonitoring(lectureId, { date: selectedDate });
      if (response.success) {
        const data = response.data.students.map(s => ({
          ...s,
          uiStatus: UI_STATUS_MAP[s.status as AttendanceStatus] || "출석"
        }));
        setStudents(data);
        setBaseStudents(JSON.parse(JSON.stringify(data))); // 딥 카피
        setPendingChanges({}); // 날짜 바뀌면 수정 내역 초기화
      }
    } catch (error) {
      toast.error("출결 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [lectureId, selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // --- 통계 계산 ---
  const presentCount = students.filter((s) => s.status === "ATTENDANCE").length;
  const lateCount = students.filter((s) => s.status === "LATE").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;

  // --- 핸들러 ---
  const handleStatusChange = (studentId: string, apiStatus: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status: apiStatus } : s));
    
    // 원본과 다르면 pendingChanges에 추가
    const original = baseStudents.find(b => b.studentId === studentId);
    if (original.status !== apiStatus) {
      setPendingChanges(prev => ({ ...prev, [studentId]: apiStatus }));
    } else {
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }
  };

  // 저장 로직 (8번 명세 활용 - 여러 번 호출)
  const handleSave = async () => {
    const changeIds = Object.keys(pendingChanges);
    if (changeIds.length === 0) return;

    setLoading(true);
    try {
      // 변경된 모든 학생에 대해 PATCH 요청을 보냅니다.
      await Promise.all(
        changeIds.map(studentId => 
          updateAttendance({
            studentId,
            lectureId,
            status: pendingChanges[studentId]
          })
        )
      );
      toast.success("변경사항이 모두 저장되었습니다.");
      await fetchAttendance(); // 서버 데이터와 동기화
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setStudents(JSON.parse(JSON.stringify(baseStudents)));
    setPendingChanges({});
  };

  // --- 페이지네이션 ---
  const PAGE_SIZE = 8;
  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  );
  const pagedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);

  return (
    <div className={loading ? "opacity-50 pointer-events-none" : ""}>
      
      <div className="p-6 border-b border-zinc-100 bg-white">
      <p className="text-xs text-zinc-400 mb-3 font-semibold uppercase tracking-wider">주차 선택</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedWeek === week 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {week}주차
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-400 mb-3 font-semibold uppercase tracking-wider">{selectedWeek}주차 수업 선택</p>
      <div className="flex gap-2">
        {/* 임시로 날짜 버튼 2개 배치 (나중엔 데이터에 따라 늘어나게 가능) */}
        <button
          onClick={() => setSelectedDate("2026-04-09")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
            selectedDate === "2026-04-09"
              ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
              : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
          }`}
        >
          4월 9일 (수)
        </button>
        <button
          onClick={() => setSelectedDate("2026-04-10")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
            selectedDate === "2026-04-10"
              ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
              : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
          }`}
        >
          4월 10일 (목)
        </button>
      </div>
    </div>


      {/* Stats 카드 섹션 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
        <div className="bg-zinc-50 rounded-lg p-4 border-t-2 border-zinc-300">
          <p className="text-xs text-zinc-400">총원</p>
          <p className="text-3xl font-bold">{students.length}</p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4 border-t-2 border-primary">
          <p className="text-xs text-zinc-400">출석</p>
          <p className="text-3xl font-bold text-primary-dark">{presentCount}</p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4 border-t-2 border-amber-400">
          <p className="text-xs text-zinc-400">지각</p>
          <p className="text-3xl font-bold text-amber-600">{lateCount}</p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4 border-t-2 border-rose-400">
          <p className="text-xs text-zinc-400">결석</p>
          <p className="text-3xl font-bold text-rose-600">{absentCount}</p>
        </div>
      </div>

      {/* 저장 바 (pendingChanges.length 기준으로 표시) */}
      <div className={`flex items-center justify-between px-6 py-3 border-y transition-colors ${Object.keys(pendingChanges).length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-100"}`}>
        <span className="text-sm font-medium">
          {Object.keys(pendingChanges).length > 0 
            ? <span className="text-amber-700">{Object.keys(pendingChanges).length}개 항목 수정됨 — [저장]을 눌러 반영하세요</span>
            : <span className="text-zinc-400">수정 사항 없음</span>}
        </span>
        <div className="flex gap-2">
          <button onClick={handleDiscard} disabled={Object.keys(pendingChanges).length === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 disabled:opacity-30">
            <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
          </button>
          <button onClick={handleSave} disabled={Object.keys(pendingChanges).length === 0} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30">
            <Save className="w-3.5 h-3.5" /> 저장
          </button>
        </div>
      </div>

      {/* 테이블 섹션 */}
      <div className="px-6 pb-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 uppercase">
              <th className="px-4 py-3">학번</th>
              <th className="px-4 py-3">성명</th>
              <th className="px-4 py-3 text-center">출결 상태</th>
              <th className="px-4 py-3 text-center">수동 수정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {pagedStudents.map((student) => {
              const isModified = !!pendingChanges[student.studentId];
              return (
                <tr key={student.studentId} className={isModified ? "bg-amber-50/50" : ""}>
                  <td className="px-4 py-3 text-sm">{student.studentId}</td>
                  <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={UI_STATUS_MAP[student.status as AttendanceStatus]} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => handleStatusChange(student.studentId, "ATTENDANCE")} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${student.status === "ATTENDANCE" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"}`}>
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(student.studentId, "LATE")} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${student.status === "LATE" ? "bg-amber-400 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                        <AlarmClock className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(student.studentId, "ABSENT")} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${student.status === "ABSENT" ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}