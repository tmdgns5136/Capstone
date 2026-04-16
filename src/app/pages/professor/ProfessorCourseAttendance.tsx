import { useState, useEffect, useCallback } from "react";
import { Search, RotateCcw, Save, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  getAttendanceMonitoring, 
  updateAttendance, 
  AttendanceStatus 
} from "../../api/attendance";

interface ProfessorCourseAttendanceProps {
  lectureId: string; // 신우님 결정: string 통일
}

const STATUS_MAP: Record<AttendanceStatus, { label: string; color: string }> = {
  PRESENT: { label: "출석", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  LATE: { label: "지각", color: "text-amber-600 bg-amber-50 border-amber-100" },
  ABSENT: { label: "결석", color: "text-rose-600 bg-rose-50 border-rose-100" },
  EXCUSED: { label: "공결", color: "text-sky-600 bg-sky-50 border-sky-100" },
  TBD: { label: "미정", color: "text-zinc-400 bg-zinc-50 border-zinc-100" },
};

export function ProfessorCourseAttendance({ lectureId }: ProfessorCourseAttendanceProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2026-03-04"); // 테스트용 기본 날짜
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ attendance: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(false);

  // 1. 데이터 로드 함수
  const fetchAttendance = useCallback(async () => {
    if (!lectureId || lectureId === "undefined") return;
    
    setLoading(true);
    try {
      const response = await getAttendanceMonitoring(lectureId, { 
        date: selectedDate,
        semester: "2026-1"
      });
      
      if (response.success) {
        setStudents(response.data.students || []);
        setStats({
          attendance: response.data.attendance || 0,
          late: response.data.late || 0,
          absent: response.data.absent || 0,
        });
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      toast.error("출결 정보를 가져오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [lectureId, selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // 2. 상태 수동 변경 함수
  const handleStatusChange = async (studentId: string, newStatus: AttendanceStatus) => {
    try {
      const response = await updateAttendance({
        studentId,
        lectureId,
        status: newStatus,
        date: selectedDate,
      });

      if (response.success) {
        toast.success(`${newStatus} 상태로 변경되었습니다.`);
        setStudents(prev => 
          prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s)
        );
      }
    } catch (error) {
      toast.error("변경 사항을 저장하지 못했습니다.");
    }
  };

  const filteredStudents = students.filter(
    (s) => s.name?.includes(searchQuery) || s.studentId?.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      {/* 주차 선택 UI */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-zinc-900">주차 선택</label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                selectedWeek === week 
                  ? "bg-zinc-900 text-white border-zinc-900" 
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
              }`}
            >
              {week}주차
            </button>
          ))}
        </div>
      </div>

      {/* 수업 날짜 선택 UI */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-zinc-900">{selectedWeek}주차 수업 선택</label>
        <div className="flex gap-2">
          <button className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium shadow-sm">
            {selectedDate} (수)
          </button>
        </div>
      </div>

      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "총원", value: students.length },
          { label: "출석", value: stats.attendance },
          { label: "지각", value: stats.late },
          { label: "결석", value: stats.absent },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
            <p className="text-xs font-medium text-zinc-400 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 학생 목록 섹션 */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              placeholder="학번 또는 이름 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>
          <button onClick={fetchAttendance} className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-lg">
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">학번</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">이름</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">상태</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">수동 변경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-300" /></td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-zinc-400 text-sm">등록된 학생이 없습니다.</td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-500">{s.studentId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">{s.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_MAP[s.status as AttendanceStatus]?.color || STATUS_MAP.TBD.color}`}>
                        {STATUS_MAP[s.status as AttendanceStatus]?.label || "미정"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.studentId, e.target.value as AttendanceStatus)}
                        className="text-xs border border-zinc-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      >
                        <option value="PRESENT">출석</option>
                        <option value="LATE">지각</option>
                        <option value="ABSENT">결석</option>
                        <option value="EXCUSED">공결</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}