import { useState, useEffect } from "react";
import { Users, Download, BarChart3, FileSpreadsheet, ChevronDown, Search } from "lucide-react";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface StudentRecord {
  studentId: string;
  name: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number;
}

const MOCK_STUDENTS: StudentRecord[] = [
  { studentId: "202110898", name: "강신우", present: 24, late: 2, absent: 4, total: 30, rate: 83.3 },
  { studentId: "202110326", name: "이승훈", present: 28, late: 1, absent: 1, total: 30, rate: 96.7 },
  { studentId: "202110595", name: "임정택", present: 20, late: 3, absent: 7, total: 30, rate: 76.7 },
  { studentId: "202310262", name: "이요한", present: 30, late: 0, absent: 0, total: 30, rate: 100 },
  { studentId: "202310265", name: "김동아", present: 27, late: 2, absent: 1, total: 30, rate: 93.3 },
  { studentId: "202410262", name: "박준혁", present: 25, late: 1, absent: 4, total: 30, rate: 86.7 },
  { studentId: "202410595", name: "최시원", present: 29, late: 0, absent: 1, total: 30, rate: 96.7 },
  { studentId: "202410600", name: "한지민", present: 22, late: 4, absent: 4, total: 30, rate: 80.0 },
  { studentId: "202410658", name: "오승현", present: 18, late: 2, absent: 10, total: 30, rate: 63.3 },
  { studentId: "202410875", name: "윤채원", present: 26, late: 3, absent: 1, total: 30, rate: 96.7 },
  { studentId: "202410955", name: "정민준", present: 15, late: 1, absent: 14, total: 30, rate: 53.3 },
];

const PREV_SEMESTER_COURSES = [
  { id: 101, name: "자료구조", students: 48, schedule: "월 10:00-11:30", room: "공학관 201" },
  { id: 102, name: "소프트웨어공학", students: 35, schedule: "수 13:00-14:30", room: "IT관 301" },
  { id: 103, name: "웹프로그래밍", students: 52, schedule: "금 09:00-10:30", room: "공학관 405" },
];

const SEMESTERS = ["2026학년도 1학기", "2025학년도 2학기"] as const;

export default function ProfessorMonitoring() {
  const { courses: currentCourses, loading } = useProfessorCourses();
  const [semester, setSemester] = useState<string>(SEMESTERS[0]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [includeStats, setIncludeStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const courses = semester === SEMESTERS[0] ? currentCourses : PREV_SEMESTER_COURSES;

  useEffect(() => {
    if (courses.length > 0) {
      setSelectedCourseId(courses[0].id);
      setSearchQuery("");
    }
  }, [semester, courses.length]);

  if (loading) return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      <div className="h-8 w-48 bg-zinc-100 rounded-xl animate-pulse" />
      <div className="bg-white rounded-xl border border-zinc-200 h-96 animate-pulse" />
    </div>
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const allStudents = MOCK_STUDENTS;
  const totalCount = allStudents.length;
  const avgRate = Math.round(allStudents.reduce((acc, s) => acc + s.rate, 0) / totalCount);
  const totalSessions = allStudents[0]?.total ?? 0;
  const filteredStudents = searchQuery.trim()
    ? allStudents.filter((s) => s.name.includes(searchQuery.trim()) || s.studentId.includes(searchQuery.trim()))
    : allStudents;

  const exportToExcel = () => {
    if (!selectedCourse) { toast.error("강의를 선택해주세요"); return; }
    const wb = XLSX.utils.book_new();
    const wsData = students.map((s) => ({
      학번: s.studentId,
      이름: s.name,
      출석: s.present,
      지각: s.late,
      결석: s.absent,
      총수업: s.total,
      출석률: `${s.rate}%`,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wsData), "출결데이터");
    if (includeStats) {
      const statsData = [
        { 항목: "총 수강생", 값: totalCount },
        { 항목: "총 수업 횟수", 값: totalSessions },
        { 항목: "평균 출석률", 값: `${avgRate}%` },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsData), "통계");
    }
    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `${selectedCourse.name}_학기출결_${today}.xlsx`);
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">출결 조회</h1>
          <p className="text-sm text-zinc-400 mt-1">강의를 선택하면 학기 전체 출결 현황을 확인할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" strokeWidth={1.5} />
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white p-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" strokeWidth={1.5} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" strokeWidth={1.5} />
            <select
              value={selectedCourseId ?? ""}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="rounded-xl border border-zinc-200 bg-white p-3 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer w-full sm:w-52"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "총 수강생", value: `${totalCount}명`, color: "border-zinc-300" },
          { label: "총 수업 횟수", value: `${totalSessions}회`, color: "border-primary" },
          { label: "평균 출석률", value: `${avgRate}%`, color: avgRate >= 80 ? "border-primary" : avgRate >= 65 ? "border-amber-400" : "border-rose-400" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-xl border border-zinc-200 border-t-2 ${stat.color} p-5`}>
            <p className="text-xs text-zinc-400">{stat.label}</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 학생별 출결 테이블 */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            학생별 학기 출결 현황
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름 또는 학번 검색"
              className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500">학번</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500">이름</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-zinc-500">출석</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-zinc-500">지각</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-zinc-500">결석</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-zinc-500">출석률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-3.5 text-sm text-zinc-500">{s.studentId}</td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-zinc-900">{s.name}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">{s.present}회</span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">{s.late}회</span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">{s.absent}회</span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.rate >= 80 ? "bg-primary" : s.rate >= 65 ? "bg-amber-400" : "bg-rose-500"}`}
                          style={{ width: `${s.rate}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${s.rate >= 80 ? "text-zinc-900" : s.rate >= 65 ? "text-amber-600" : "text-rose-600"}`}>
                        {s.rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 내보내기 */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            데이터 내보내기
          </h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-700">
              <input type="checkbox" checked readOnly className="w-4 h-4 rounded border-zinc-300" />
              상세 출결 데이터
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300"
              />
              통계 요약 시트
            </label>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            {selectedCourse?.name || "강의명"}_학기출결.xlsx
          </button>
        </div>
      </div>

    </div>
  );
}
