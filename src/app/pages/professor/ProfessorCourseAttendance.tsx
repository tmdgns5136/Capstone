import { useState, useEffect, useCallback, useMemo } from "react";
import { Save, RotateCcw, Check, AlarmClock, X, Search, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { getAttendanceMonitoring, updateAttendance } from "../../api/attendance";
import { getSemesterStartDate } from "../../constants/semester";
import { AnimatePresence, motion } from "motion/react";

interface ProfessorCourseAttendanceProps {
  lectureId: string;
}

export function ProfessorCourseAttendance({ lectureId }: ProfessorCourseAttendanceProps) {
  const { courses } = useProfessorCourses();
  
  // 🌟 [수정 1] 강의 시간표를 분석하여 해당 강의가 총 몇 교시짜리 수업인지 동적으로 계산합니다.
  const maxPeriods = useMemo(() => {
    const currentCourse = courses.find(c => String(c.lectureId) === String(lectureId));
    if (!currentCourse) return 2; // 기본값

    // schedule 예시: "화 13:00-15:00" 또는 "월 09:00-12:00"
    const timeMatch = currentCourse.schedule?.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    if (timeMatch) {
      const startHour = parseInt(timeMatch[1], 10);
      const endHour = parseInt(timeMatch[3], 10);
      const diff = endHour - startHour;
      return diff > 0 ? diff : 2; // 시간 차이가 곧 총 교시 수
    }
    return 2;
  }, [courses, lectureId]);

  const SCHEDULE = useMemo(() => {
    const currentCourse = courses.find(c => String(c.lectureId) === String(lectureId));
    if (!currentCourse) return [];

    const dayMap: Record<string, number> = { 
      '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0,
      MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 0 
    };

    const rawDays = (currentCourse as any)?.lecture_day || (currentCourse as any)?.lectureDay;
    let lectureDays: string[] = [];

    if (rawDays) {
      lectureDays = rawDays.split(',').map((d: string) => d.trim().toUpperCase());
    } else if (currentCourse.schedule) {
      const foundDays = currentCourse.schedule.match(/월요일|화요일|수요일|목요일|금요일|토요일|일요일|[월화수목금토]/g);
      if (foundDays) {
        lectureDays = [...new Set(
          foundDays.map(d => d.length > 1 ? d[0] : d)
        )];
      }
    }

    const startDate = getSemesterStartDate();

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

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const saved = sessionStorage.getItem(`prof_${lectureId}_week`);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const saved = sessionStorage.getItem(`prof_${lectureId}_period`);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    return sessionStorage.getItem(`prof_${lectureId}_sessionId`) || "w1-1";
  });

  // 🌟 [수정 2] 교시 수가 다른 강의로 변경되었을 때, 선택된 교시가 범위를 벗어나면 1교시로 안전하게 맞춰줍니다.
  useEffect(() => {
    if (selectedPeriod > maxPeriods) {
      setSelectedPeriod(1);
    }
  }, [maxPeriods, selectedPeriod]);

  useEffect(() => { sessionStorage.setItem(`prof_${lectureId}_week`, String(selectedWeek)); }, [selectedWeek, lectureId]);
  useEffect(() => { sessionStorage.setItem(`prof_${lectureId}_period`, String(selectedPeriod)); }, [selectedPeriod, lectureId]);
  useEffect(() => { sessionStorage.setItem(`prof_${lectureId}_sessionId`, selectedSessionId); }, [selectedSessionId, lectureId]);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, any[]>>({});
  const [pendingMap, setPendingMap] = useState<Record<string, any[]>>({});

  const currentWeekData = SCHEDULE.find((w) => w.week === selectedWeek);
  const selectedSession = currentWeekData?.sessions?.find((s: { sessionId: string }) => s.sessionId === selectedSessionId) ?? currentWeekData?.sessions?.[0];
  const sessionDate = selectedSession?.date ?? "";

  // 🌟 [수정 3] 백엔드는 주차와 무관하게 당일 '1교시, 2교시' 순으로 세션을 판정하므로 복잡한 누적 곱셈을 지우고 선택된 교시를 그대로 매핑합니다.
  const absoluteSessionNum = selectedPeriod;
  
  const key = useMemo(() => {
    return `${selectedSessionId || "initial"}-p${absoluteSessionNum}`;
  }, [selectedSessionId, absoluteSessionNum]);

  const fetchAttendance = useCallback(async () => {
    if (!lectureId || !sessionDate) return;
    
    setLoading(true);
    try {
      const response = await getAttendanceMonitoring(lectureId, { 
        date: sessionDate, 
        sessionNum: absoluteSessionNum 
      });
      
      if (response.success) {
        const mapped = (response.data.students || []).map((s: any) => {
          const matched = s.sessions.find((sess: any) => sess.sessionNum === absoluteSessionNum);
          const statusMap: Record<string, string> = {
            "ATTEND": "출석", "LATENESS": "지각", "ABSENCE": "결석", "TBD": "미정"
          };
          return {
            ...s,
            status: matched ? (statusMap[matched.status] || "미정") : "미정"
          };
        });
        setSavedMap(prev => ({ ...prev, [key]: mapped }));
      }
    } catch { 
      toast.error("데이터 로드 실패"); 
    } finally { 
      setLoading(false); 
    }
  }, [lectureId, sessionDate, absoluteSessionNum, key]);

  useEffect(() => {
    fetchAttendance();
  }, [key, fetchAttendance]);

  const handleSave = async () => {
    if (!hasPending) return;
    setLoading(true);
    try {
      const modified = students.filter((s, i) => s.status !== baseStudents[i].status);
      
      const results = await Promise.allSettled(modified.map(s => {
        const dbStat = s.status === "출석" ? "ATTEND" : s.status === "지각" ? "LATENESS" : "ABSENCE";
        return updateAttendance({ 
          studentId: s.studentId, 
          lectureId: String(lectureId), 
          status: dbStat, 
          date: sessionDate, 
          sessionNum: absoluteSessionNum 
        });
      }));

      const failedCount = results.filter(r => r.status === 'rejected').length;
      
      if (failedCount > 0) {
        toast.error(`${failedCount}명의 출결 저장에 실패했습니다. 다시 시도해주세요.`);
      } else {
        toast.success(`${selectedWeek}주차 ${selectedPeriod}교시 출결 저장 완료`);
      }

      await fetchAttendance();
      setPendingMap((prev) => { const n = { ...prev }; delete n[key]; return n; });
    } catch { 
      toast.error("저장 중 오류가 발생했습니다."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week);
    const targetWeekData = SCHEDULE.find((w) => w.week === week);
    if (targetWeekData?.sessions?.[0]) {
      setSelectedSessionId(targetWeekData.sessions[0].sessionId);
    }
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

  const handleDiscard = () => {
    setPendingMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

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

  const filteredStudents = students.filter(s => s.name.includes(searchQuery) || s.studentId.includes(searchQuery));
  const pagedStudents = filteredStudents.slice((page - 1) * 8, page * 8);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      
      {/* 주차 및 일시 선택 통합 패널 */}
      <div className="px-4 sm:px-6 py-5 border-b border-zinc-100 bg-zinc-50">
        
        {/* 주차 선택 UI */}
        <div className="mb-4">
          <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-tighter">주차 선택</p>
          <div className="flex flex-wrap gap-1.5">
            {SCHEDULE.map((w) => (
              <button key={w.week} onClick={() => handleWeekSelect(w.week)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${selectedWeek === w.week ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100"}`}>
                {w.week}주차
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 선택 UI */}
        <div className="mb-4">
          <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-tighter">수업 날짜</p>
          <div className="flex gap-2">
            {currentWeekData.sessions.map((session: { sessionId: string; dateLabel: string }) => (
              <button key={session.sessionId} onClick={() => { setSelectedSessionId(session.sessionId); setPage(1); }}
                className={`px-5 py-2 rounded-[20px] text-xs font-black transition-all ${
                  selectedSessionId === session.sessionId ? "bg-[#18181B] text-white shadow-lg" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                }`}>
                {session.dateLabel}
              </button>
            ))}
          </div>
        </div>
          
        {/* 🌟 [수정 4] 하드코딩을 없애고 위에서 계산한 maxPeriods 만큼 동적으로 교시 버튼 생성 */}
        <div>
          <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-tighter">교시 선택</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: maxPeriods }, (_, i) => i + 1).map((num) => (
              <button 
                key={num} 
                onClick={() => { setSelectedPeriod(num); setPage(1); }}
                className={`w-9 h-8 flex items-center justify-center rounded text-[11px] font-bold transition-all ${
                  selectedPeriod === num 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6">
        {[
          { label: "총원", value: students.length, color: "border-zinc-300", numColor: "text-zinc-900" },
          { label: "출석", value: presentCount, color: "border-primary", numColor: "text-primary" },
          { label: "지각", value: lateCount, color: "border-amber-400", numColor: "text-amber-500" },
          { label: "결석", value: absentCount, color: "border-rose-400", numColor: "text-rose-500" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-lg p-3 sm:p-4 border shadow-sm ${stat.color}`}>
            <p className="text-xs text-zinc-400">{stat.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${stat.numColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 수정 안내 팝업 바 */}
      <div className="min-h-[60px]">
        <AnimatePresence>
          {hasPending ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between px-6 py-3 bg-amber-50 border-y border-amber-200 shadow-inner"
            >
              <span className="text-sm font-medium text-amber-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {pendingCount}개 항목이 수정되었습니다 (저장 전까지 반영되지 않음)
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleDiscard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
                </button>
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-md">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
                  {loading ? "저장 중" : "저장하기"}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between px-6 py-3 bg-white border-y border-zinc-100 h-full">
              <span className="text-sm font-medium text-zinc-300 font-bold">수정 사항 없음</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="학생 이름 또는 학번 검색" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-zinc-50 focus:bg-white transition-colors" />
        </div>
      </div>

      {/* 학생 목록 메인 뷰 */}
      <div className="px-4 sm:px-6 pb-6 mt-4">
        {/* 모바일 뷰 */}
        <div className="lg:hidden space-y-3">
          {loading && students.length === 0 ? (
            <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-300" /></div>
          ) : pagedStudents.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-400">{searchQuery ? "검색 결과가 없습니다" : "등록된 학생이 없습니다"}</div>
          ) : pagedStudents.map((student) => (
            <div key={student.studentId} className={`p-4 rounded-xl border ${hasPending && baseStudents.find(b => b.studentId === student.studentId)?.status !== student.status ? "bg-amber-50/60 border-amber-200" : "bg-white border-zinc-100"} shadow-sm flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{student.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{student.studentId}</p>
                </div>
                <StatusBadge status={student.status} />
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-100 justify-end">
                <button onClick={() => handleStatusChange(student.studentId, "출석")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.status === "출석" ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-400"}`}><Check className="w-4 h-4" /></button>
                <button onClick={() => handleStatusChange(student.studentId, "지각")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.status === "지각" ? "bg-amber-400 text-white shadow-md" : "bg-zinc-100 text-zinc-400"}`}><AlarmClock className="w-4 h-4" /></button>
                <button onClick={() => handleStatusChange(student.studentId, "결석")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.status === "결석" ? "bg-rose-500 text-white shadow-md" : "bg-zinc-100 text-zinc-400"}`}><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* 데스크탑 테이블 뷰 */}
        <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">학번</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">성명</th>
                <th className="text-center px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">출결 상태</th>
                <th className="text-center px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">수동 수정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading && students.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-300" /></td></tr>
              ) : pagedStudents.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-sm text-zinc-400">{searchQuery ? "검색 결과가 없습니다" : "등록된 학생이 없습니다"}</td></tr>
              ) : pagedStudents.map((student) => (
                <tr key={student.studentId} className={`transition-colors ${hasPending && baseStudents.find(b => b.studentId === student.studentId)?.status !== student.status ? "bg-amber-50/60" : "hover:bg-zinc-50/50"}`}>
                  <td className="px-5 py-4 text-sm text-zinc-500 font-medium">{student.studentId}</td>
                  <td className="px-5 py-4 text-sm font-bold text-zinc-900">{student.name}</td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={student.status} /></td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleStatusChange(student.studentId, "출석")} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${student.status === "출석" ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"}`}><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleStatusChange(student.studentId, "지각")} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${student.status === "지각" ? "bg-amber-400 text-white shadow-md" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"}`}><AlarmClock className="w-4 h-4" /></button>
                      <button onClick={() => handleStatusChange(student.studentId, "결석")} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${student.status === "결석" ? "bg-rose-500 text-white shadow-md" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"}`}><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(filteredStudents.length / 8))} onPageChange={setPage} className="py-5 border-t border-zinc-100" />
    </div>
  );
}