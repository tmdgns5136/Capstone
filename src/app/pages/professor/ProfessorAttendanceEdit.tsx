import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, RotateCcw, Save, Check, X, AlarmClock, Loader2, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { getAttendanceMonitoring, updateAttendance } from "../../api/attendance";

export default function ProfessorAttendanceEdit() {
  const { courses, loading: coursesLoading } = useProfessorCourses();
  const [selectedLectureId, setSelectedLectureId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  // 1. [로직 복구] DB 요일(WEDNESDAY) 기반 날짜 생성
  const schedule = useMemo(() => {
    const currentCourse = courses.find(c => String(c.lectureId) === selectedLectureId);
    const dayMap: Record<string, number> = { MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5 };
    const targetDay = dayMap[(currentCourse as any)?.lecture_day || "WEDNESDAY"] || 3;
    const startDate = new Date(2026, 2, 2);

    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + (targetDay - 1) + (i * 7));
      return {
        week: i + 1,
        date: d.toISOString().split("T")[0],
        dateLabel: `${d.getMonth() + 1}월 ${d.getDate()}일`,
      };
    });
  }, [courses, selectedLectureId]);

  const currentSession = schedule[selectedWeek - 1];

  const fetchAttendance = useCallback(async () => {
    if (!selectedLectureId || !currentSession) return;
    setLoading(true);
    try {
      const response = await getAttendanceMonitoring(selectedLectureId, { date: currentSession.date });
      if (response.success) {
        setStudents(response.data.students || []);
        setPendingChanges({});
      }
    } catch { toast.error("로드 실패"); } finally { setLoading(false); }
  }, [selectedLectureId, currentSession]);

  useEffect(() => {
    if (courses.length > 0 && !selectedLectureId) setSelectedLectureId(String(courses[0].lectureId));
  }, [courses, selectedLectureId]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleStatusChangeLocal = (id: string, status: any) => {
    setPendingChanges(prev => ({ ...prev, [id]: status }));
    setStudents(prev => prev.map(s => s.studentId === id ? { ...s, status } : s));
  };

  const handleSave = async () => {
    const changeIds = Object.keys(pendingChanges);
    if (changeIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(changeIds.map(id => updateAttendance({ 
        studentId: id, lectureId: selectedLectureId, status: pendingChanges[id], date: currentSession.date 
      })));
      toast.success("저장 완료");
      fetchAttendance();
    } catch { toast.error("저장 실패"); } finally { setLoading(false); }
  };

  const filteredStudents = students.filter(s => s.name?.includes(searchQuery) || s.studentId?.includes(searchQuery));

  if (coursesLoading) return <div className="p-20 text-center text-zinc-400">강의 로딩 중...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 space-y-8">
      {/* Header & Filters */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">수동 출결 변경</h1>
          <p className="text-sm text-zinc-400 font-bold mt-1">출석률과 수업 날짜를 확인하며 수정하세요</p>
        </div>
        <button onClick={fetchAttendance} className="p-3 bg-zinc-900 text-white rounded-2xl shadow-lg active:scale-95"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-2 rounded-[24px] border border-zinc-100 shadow-sm flex items-center gap-2">
          <div className="px-4 py-2 bg-zinc-50 rounded-xl text-[11px] font-bold text-zinc-400">강의</div>
          <select value={selectedLectureId} onChange={e => setSelectedLectureId(e.target.value)} className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none cursor-pointer">
            {courses.map(c => <option key={c.lectureId} value={String(c.lectureId)}>{c.name}</option>)}
          </select>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-zinc-100 shadow-sm flex items-center gap-2">
          <div className="px-4 py-2 bg-zinc-50 rounded-xl text-[11px] font-bold text-zinc-400">주차</div>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none cursor-pointer">
            {schedule.map(s => <option key={s.week} value={s.week}>{s.week}주차</option>)}
          </select>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-zinc-100 shadow-sm flex items-center gap-2 px-4">
          <Search className="w-4 h-4 text-zinc-300" />
          <input placeholder="이름 또는 학번" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none text-sm font-bold outline-none" />
        </div>
      </div>

      {/* 저장 배너 */}
      <AnimatePresence>
        {Object.keys(pendingChanges).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-[24px] px-6 py-4 flex items-center justify-between shadow-md">
            <p className="text-sm text-[#92400E] font-medium">{Object.keys(pendingChanges).length}개 항목 수정됨</p>
            <div className="flex gap-4">
              <button onClick={() => fetchAttendance()} className="text-xs text-zinc-400 font-bold flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> 되돌리기</button>
              <button onClick={handleSave} className="bg-[#6366F1] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"><Save className="w-4 h-4" /> 저장</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 테이블 (체류율 게이지 탑재) */}
      <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-zinc-50">
              <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">학번 / 이름</th>
              <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">날짜</th>
              <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">누적 체류율</th>
              <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">상태</th>
              <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">수정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredStudents.map(student => (
              <tr key={student.studentId} className={`hover:bg-zinc-50/40 transition-colors ${!!pendingChanges[student.studentId] ? "bg-amber-50/30" : ""}`}>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-zinc-900">{student.name}</p>
                  <p className="text-[11px] text-zinc-400 font-bold">{student.studentId}</p>
                </td>
                <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{currentSession.date}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3 w-40">
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${student.rate >= 80 ? 'bg-zinc-900' : 'bg-amber-400'}`} style={{ width: `${student.rate}%` }} />
                    </div>
                    <span className="text-[11px] font-black text-zinc-500">{student.rate}%</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${student.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>{student.status}</span>
                </td>
                <td className="px-8 py-6">
                  <select value={student.status} onChange={e => handleStatusChangeLocal(student.studentId, e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-zinc-900/5 cursor-pointer">
                    <option value="PRESENT">출석</option>
                    <option value="LATE">지각</option>
                    <option value="ABSENT">결석</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}