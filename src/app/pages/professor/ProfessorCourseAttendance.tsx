import { useState } from "react";
import { Save, RotateCcw, Check, AlarmClock, X, Search } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";

type AttendanceStatus = "출석" | "지각" | "결석";

interface Student {
  studentId: string;
  name: string;
  status: AttendanceStatus;
}

interface Session {
  sessionId: string;
  date: string;       // "2025-03-04"
  dateLabel: string;  // "3월 4일 (화)"
}

interface Week {
  week: number;
  sessions: Session[];
}

// 주차별 수업 일정 (화/목 주 2회 수업 기준, 총 15주)
const SCHEDULE: Week[] = Array.from({ length: 15 }, (_, i) => {
  const week = i + 1;
  const baseDate = new Date("2025-03-04");
  baseDate.setDate(baseDate.getDate() + i * 7);
  const thuDate = new Date(baseDate);
  thuDate.setDate(baseDate.getDate() + 2);
  return {
    week,
    sessions: [
      {
        sessionId: `w${week}-1`,
        date: baseDate.toISOString().split("T")[0],
        dateLabel: `${baseDate.getMonth() + 1}월 ${baseDate.getDate()}일 (화)`,
      },
      {
        sessionId: `w${week}-2`,
        date: thuDate.toISOString().split("T")[0],
        dateLabel: `${thuDate.getMonth() + 1}월 ${thuDate.getDate()}일 (목)`,
      },
    ],
  };
});

const BASE_STUDENTS: Student[] = [
  { studentId: "202110898", name: "강신우", status: "출석" },
  { studentId: "202110326", name: "이승훈", status: "지각" },
  { studentId: "202110595", name: "임정택", status: "결석" },
  { studentId: "202310262", name: "이요한", status: "출석" },
  { studentId: "202310265", name: "김동아", status: "출석" },
  { studentId: "202410262", name: "박준혁", status: "출석" },
  { studentId: "202410595", name: "최서윤", status: "출석" },
  { studentId: "202410600", name: "한지민", status: "출석" },
  { studentId: "202410658", name: "오승현", status: "지각" },
  { studentId: "202410875", name: "윤채원", status: "출석" },
  { studentId: "202410955", name: "정민준", status: "결석" },
];

// 세션별로 약간 다른 출결 데이터를 반환
function getAttendanceForSession(sessionId: string): Student[] {
  const seed = sessionId.charCodeAt(sessionId.length - 1);
  return BASE_STUDENTS.map((s, i) => {
    if (s.status !== "출석") return s;
    const statuses: AttendanceStatus[] = ["출석", "출석", "출석", "지각", "결석"];
    return { ...s, status: statuses[(i + seed) % statuses.length] };
  });
}

export function ProfessorCourseAttendance() {
  const currentWeekIndex = 4; // 5주차를 현재로 가정
  const [selectedWeek, setSelectedWeek] = useState(SCHEDULE[currentWeekIndex].week);
  const [selectedSessionId, setSelectedSessionId] = useState(SCHEDULE[currentWeekIndex].sessions[0].sessionId);
  const [page, setPage] = useState(1);
  const [savedMap, setSavedMap] = useState<Record<string, Student[]>>({});
  const [pendingMap, setPendingMap] = useState<Record<string, Student[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const currentWeekData = SCHEDULE.find((w) => w.week === selectedWeek)!;
  const hasMultipleSessions = currentWeekData.sessions.length > 1;
  const selectedSession = currentWeekData.sessions.find((s) => s.sessionId === selectedSessionId)
    ?? currentWeekData.sessions[0];

  const key = selectedSession.sessionId;
  const baseStudents = savedMap[key] ?? getAttendanceForSession(key);
  const students = pendingMap[key] ?? baseStudents;
  const hasPending = !!pendingMap[key];

  const pendingCount = hasPending
    ? students.filter((s, i) => s.status !== baseStudents[i].status).length
    : 0;

  const presentCount = students.filter((s) => s.status === "출석").length;
  const lateCount = students.filter((s) => s.status === "지각").length;
  const absentCount = students.filter((s) => s.status === "결석").length;

  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week);
    setSelectedSessionId(SCHEDULE.find((w) => w.week === week)!.sessions[0].sessionId);
    setPage(1);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const current = pendingMap[key] ?? baseStudents;
    const next = current.map((s) => s.studentId === studentId ? { ...s, status } : s);
    const isIdentical = next.every((s, i) => s.status === baseStudents[i].status);
    if (isIdentical) {
      setPendingMap((prev) => { const p = { ...prev }; delete p[key]; return p; });
    } else {
      setPendingMap({ ...pendingMap, [key]: next });
    }
  };

  const handleSave = () => {
    if (!hasPending) return;
    setSavedMap({ ...savedMap, [key]: students });
    setPendingMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
    toast.success("출결이 저장되었습니다.");
  };

  const handleDiscard = () => {
    setPendingMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const PAGE_SIZE = 8;
  const filteredStudents = searchQuery.trim()
    ? students.filter((s) => s.name.includes(searchQuery.trim()) || s.studentId.includes(searchQuery.trim()))
    : students;
  const pagedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);

  return (
    <div>
      {/* 주차 선택 */}
      <div className="px-6 pt-5 pb-3 border-b border-zinc-100">
        <p className="text-xs font-medium text-zinc-400 mb-3">주차 선택</p>
        <div className="flex flex-wrap gap-2">
          {SCHEDULE.map((w) => (
            <button
              key={w.week}
              onClick={() => handleWeekSelect(w.week)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedWeek === w.week
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {w.week}주차
            </button>
          ))}
        </div>
      </div>

      {/* 날짜 선택 (같은 주차에 수업이 2개 이상일 때) */}
      {hasMultipleSessions && (
        <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-medium text-zinc-400 mb-2">{selectedWeek}주차 수업 선택</p>
          <div className="flex gap-2">
            {currentWeekData.sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => { setSelectedSessionId(session.sessionId); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedSessionId === session.sessionId
                    ? "bg-zinc-900 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {session.dateLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
        {[
          { label: "총원", value: students.length, color: "border-zinc-300" },
          { label: "출석", value: presentCount, color: "border-primary" },
          { label: "지각", value: lateCount, color: "border-amber-400" },
          { label: "결석", value: absentCount, color: "border-rose-400" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-zinc-50 rounded-lg p-3 sm:p-4 border-t-2 ${stat.color}`}>
            <p className="text-xs text-zinc-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 저장 바 */}
      <div className={`flex items-center justify-between px-6 py-3 border-t border-b transition-colors ${hasPending ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-100"}`}>
        <span className="text-sm font-medium">
          {hasPending
            ? <span className="text-amber-700">{pendingCount}개 항목이 수정되었습니다 — 저장 전까지 반영되지 않습니다</span>
            : <span className="text-zinc-400">수정 사항 없음</span>}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDiscard}
            disabled={!hasPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> 되돌리기
          </button>
          <button
            onClick={handleSave}
            disabled={!hasPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> 저장
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="학생 이름 또는 학번 검색"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">학번</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">성명</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500">출결 상태</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500">수동 수정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {pagedStudents.map((student) => {
              const isModified = hasPending && baseStudents.find((b) => b.studentId === student.studentId)?.status !== student.status;
              return (
              <tr key={student.studentId} className={`transition-colors ${isModified ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-zinc-50/50"}`}>
                <td className="px-4 py-3 text-sm text-zinc-600">{student.studentId}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">{student.name}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleStatusChange(student.studentId, "출석")} title="출석"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${student.status === "출석" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400 hover:bg-emerald-100 hover:text-emerald-600"}`}>
                      <Check className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button onClick={() => handleStatusChange(student.studentId, "지각")} title="지각"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${student.status === "지각" ? "bg-amber-400 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-amber-100 hover:text-amber-600"}`}>
                      <AlarmClock className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button onClick={() => handleStatusChange(student.studentId, "결석")} title="결석"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${student.status === "결석" ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-rose-100 hover:text-rose-600"}`}>
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="py-4 border-t border-zinc-100" />
    </div>
  );
}
