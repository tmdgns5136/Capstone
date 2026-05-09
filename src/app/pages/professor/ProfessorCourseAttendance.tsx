import { useState, useEffect, useCallback, useMemo } from "react";
import { Save, RotateCcw, Check, AlarmClock, X, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { getAttendanceMonitoring, updateAttendance } from "../../api/attendance";

interface ProfessorCourseAttendanceProps {
  lectureId: string;
}

export function ProfessorCourseAttendance({ lectureId }: ProfessorCourseAttendanceProps) {
  const { courses } = useProfessorCourses();
  
  // 1. [수정] 시차 문제 해결된 날짜 계산 로직
  const SCHEDULE = useMemo(() => {
    const currentCourse = courses.find(c => String(c.lectureId) === String(lectureId));
    if (!currentCourse) return [];

    const dayMap: Record<string, number> = { 
      '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0,
      MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 0 
    };

    // 1) lecture_day가 있으면 쓰고, 없으면 schedule(화 00:00...) 문자열에서 요일을 추출합니다.
    const rawDays = (currentCourse as any)?.lecture_day || (currentCourse as any)?.lectureDay;
    let lectureDays: string[] = [];

    if (rawDays) {
      lectureDays = rawDays.split(',').map((d: string) => d.trim().toUpperCase());
    } else if (currentCourse.schedule) {
      // "화 14:00..., 목 15:00..." 형태에서 한글 요일만 뽑아냅니다.
      const foundDays = currentCourse.schedule.match(/[월화수목금토일]/g);
      if (foundDays) lectureDays = foundDays;
    }

    // 요일 정보가 전혀 없으면 기본값 수요일
    if (lectureDays.length === 0) lectureDays = ["수"];

    const startDate = new Date(2026, 2, 2); // 3월 2일 월요일

    return Array.from({ length: 15 }, (_, i) => {
      const week = i + 1;
      const sessions = lectureDays.map((dayName: string, subIdx: number) => {
        const targetDay = dayMap[dayName] || 3;
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (targetDay - 1) + (i * 7));
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const dayLabel = ["일","월","화","수","목","금","토"][d.getDay()];

        return {
          sessionId: `w${week}-${subIdx + 1}`,
          date: dateStr,
          dateLabel: `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayLabel})`,
        };
      });

      return { week, sessions };
    });
  }, [courses, lectureId]);

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState("w1-1");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [savedMap, setSavedMap] = useState<Record<string, any[]>>({});
  const [pendingMap, setPendingMap] = useState<Record<string, any[]>>({});

  const currentWeekData = SCHEDULE.find((w) => w.week === selectedWeek)!;
  const selectedSession = currentWeekData?.sessions?.find((s: { sessionId: string }) => s.sessionId === selectedSessionId) ?? currentWeekData?.sessions?.[0];
  const key = selectedSession?.sessionId ?? "";
  const sessionDate = selectedSession?.date ?? "";

  const fetchAttendance = useCallback(async () => {
    if (!lectureId || !sessionDate || !key) return;
    setLoading(true);
    try {
      const response = await getAttendanceMonitoring(lectureId, { date: sessionDate });
      if (response.success) {
        const mapped = (response.data.students || []).map((s: any) => ({
          ...s,
          status: s.status === "PRESENT" ? "출석" : s.status === "LATE" ? "지각" : s.status === "ABSENT" ? "결석" : s.status === "EXCUSED" ? "공결" : "미정"
        }));
        setSavedMap(prev => ({ ...prev, [key]: mapped }));
      }
    } catch { toast.error("로드 실패"); } finally { setLoading(false); }
  }, [lectureId, sessionDate, key]);

  useEffect(() => {
    if (!savedMap[key]) fetchAttendance();
  }, [key, fetchAttendance, savedMap]);

  if (!currentWeekData || !selectedSession) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-zinc-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }
  
  const baseStudents = savedMap[key] ?? [];
  const students = pendingMap[key] ?? baseStudents;
  const hasPending = !!pendingMap[key];
  const pendingCount = hasPending ? students.filter((s, i) => s.status !== baseStudents[i]?.status).length : 0;

  const presentCount = students.filter(s => s.status === "출석").length;
  const lateCount = students.filter(s => s.status === "지각").length;
  const absentCount = students.filter(s => s.status === "결석").length;

  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week);
    setSelectedSessionId(SCHEDULE.find((w) => w.week === week)!.sessions[0].sessionId);
    setPage(1);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    const current = pendingMap[key] ?? baseStudents;
    const next = current.map((s) => s.studentId === studentId ? { ...s, status } : s);
    if (next.every((s, i) => s.status === baseStudents[i]?.status)) {
      setPendingMap((prev) => { const p = { ...prev }; delete p[key]; return p; });
    } else {
      setPendingMap({ ...pendingMap, [key]: next });
    }
  };

  const handleSave = async () => {
    if (!hasPending) return;
    setLoading(true);
    try {
      const modified = students.filter((s, i) => s.status !== baseStudents[i].status);
      await Promise.all(modified.map(s => {
        const dbStat = s.status === "출석" ? "PRESENT" : s.status === "지각" ? "LATE" : s.status === "결석" ? "ABSENT" : "EXCUSED";
        return updateAttendance({ studentId: s.studentId, lectureId, status: dbStat, date: sessionDate });
      }));
      setSavedMap({ ...savedMap, [key]: students });
      setPendingMap((prev) => { const n = { ...prev }; delete n[key]; return n; });
      toast.success("저장되었습니다.");
    } catch { toast.error("저장 실패"); } finally { setLoading(false); }
  };

  const handleDiscard = () => {
    setPendingMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const filteredStudents = students.filter(s => s.name.includes(searchQuery) || s.studentId.includes(searchQuery));
  const pagedStudents = filteredStudents.slice((page - 1) * 8, page * 8);
  
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      {/* 주차 선택 */}
      <div className="px-6 pt-5 pb-3 border-b border-zinc-100">
        <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-tighter">주차 선택</p>
        <div className="flex flex-wrap gap-2">
          {SCHEDULE.map((w) => (
            <button key={w.week} onClick={() => handleWeekSelect(w.week)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedWeek === w.week ? "bg-zinc-900 text-white shadow-md" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-200"}`}>
              {w.week}주차
            </button>
          ))}
        </div>
      </div>

      {/* [수정] 날짜 선택 - 이제 무조건 나타납니다 (image_bf76a4 복구) */}
      <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50">
        <p className="text-xs font-medium text-zinc-400 mb-2">{selectedWeek}주차 수업 선택</p>
        <div className="flex gap-2">
          {currentWeekData.sessions.map((session: { sessionId: string; dateLabel: string }) => (
            <button key={session.sessionId} onClick={() => { setSelectedSessionId(session.sessionId); setPage(1); }}
              className={`px-8 py-3 rounded-[20px] text-sm font-black transition-all ${
                selectedSessionId === session.sessionId ? "bg-[#18181B] text-white shadow-xl" : "bg-white border border-zinc-200 text-zinc-600"
              }`}
            >
              {session.dateLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
        {[
          { label: "총원", value: students.length, color: "border-zinc-300", numColor: "text-zinc-900" },
          { label: "출석", value: presentCount, color: "border-primary", numColor: "text-primary" },
          { label: "지각", value: lateCount, color: "border-amber-400", numColor: "text-amber-500" },
          { label: "결석", value: absentCount, color: "border-rose-400", numColor: "text-rose-500" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-zinc-50 rounded-lg p-3 sm:p-4 border-t-2 ${stat.color}`}>
            <p className="text-xs text-zinc-400">{stat.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${stat.numColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 저장 바 */}
      <div className={`flex items-center justify-between px-6 py-3 border-t border-b transition-colors ${hasPending ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-100"}`}>
        <span className="text-sm font-medium">
          {hasPending ? <span className="text-amber-700 font-bold">{pendingCount}개 항목이 수정되었습니다 — 저장 전까지 반영되지 않습니다</span> : <span className="text-zinc-300 font-bold">수정 사항 없음</span>}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleDiscard} disabled={!hasPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">
            <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
          </button>
          <button onClick={handleSave} disabled={!hasPending} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/80 disabled:opacity-30 shadow-lg">
            <Save className="w-3.5 h-3.5" /> {loading ? "저장 중" : "저장"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="학생 이름 또는 학번 검색" className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6 overflow-x-auto mt-4">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">학번</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">성명</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">출결 상태</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">수동 수정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading && students.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-200" /></td></tr>
            ) : pagedStudents.map((student) => (
              <tr key={student.studentId} className={`transition-colors ${hasPending && baseStudents.find(b => b.studentId === student.studentId)?.status !== student.status ? "bg-amber-50/60" : "hover:bg-zinc-50/30"}`}>
                <td className="px-4 py-3 text-sm text-zinc-400 font-medium">{student.studentId}</td>
                <td className="px-4 py-3 text-sm font-bold text-zinc-900">{student.name}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={student.status} /></td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleStatusChange(student.studentId, "출석")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.status === "출석" ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-300"}`}><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleStatusChange(student.studentId, "지각")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.status === "지각" ? "bg-amber-400 text-white shadow-md" : "bg-zinc-100 text-zinc-300"}`}><AlarmClock className="w-4 h-4" /></button>
                    <button onClick={() => handleStatusChange(student.studentId, "결석")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.status === "결석" ? "bg-rose-500 text-white shadow-md" : "bg-zinc-100 text-zinc-300"}`}><X className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={Math.ceil(filteredStudents.length / 8)} onPageChange={setPage} className="py-4 border-t border-zinc-100" />
    </div>
  );
}