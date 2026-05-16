import { useState, useEffect, useCallback } from "react";
import { Users, BarChart3, ChevronDown, Search, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { toast } from "sonner";
import * as XLSX from "xlsx"; // 엑셀 라이브러리 임포트 확인
import { getAttendanceMonitoring, AttendanceMonitoringData } from "../../api/attendance";
import { CURRENT_SEMESTER_CODE, PREV_SEMESTER_CODE } from "../../constants/semester";

const SEMESTERS = [CURRENT_SEMESTER_CODE, PREV_SEMESTER_CODE] as const;

export default function ProfessorMonitoring() {
  const { courses, loading: coursesLoading } = useProfessorCourses();

  // 상태 관리
  const [semester, setSemester] = useState<string>(SEMESTERS[0]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [monitoringData, setMonitoringData] = useState<AttendanceMonitoringData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [includeStats, setIncludeStats] = useState(true); // 엑셀 옵션 상태 추가

  // 현재 선택된 강의 객체 찾기
  const selectedCourse = courses.find(c => c.lectureId === selectedCourseId);

  // 1. 데이터 호출 함수
  const fetchMonitoringData = useCallback(async () => {
    if (!selectedCourseId) return;
    setDataLoading(true);
    try {
      const response = await getAttendanceMonitoring(selectedCourseId, { semester });
      if (response.success) {
        setMonitoringData(response.data);
      }
    } catch (error) {
      toast.error("출결 통계를 불러오는 데 실패했습니다.");
    } finally {
      setDataLoading(false);
    }
  }, [selectedCourseId, semester]);

  // 강의 목록 로드 시 첫 번째 강의 자동 선택
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].lectureId);
    }
  }, [courses, selectedCourseId]);

  // 강의나 학기가 바뀔 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // 2. 엑셀 내보내기 함수 (실제 데이터 반영)
  const exportToExcel = () => {
    if (!monitoringData || !selectedCourse) {
      toast.error("데이터가 준비되지 않았습니다.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // 상세 데이터 시트
    const wsData = monitoringData.students.map((s) => ({
      학번: s.studentId,
      이름: s.name,
      출석: `${s.present}회`,
      지각: `${s.late}회`,
      결석: `${s.absent}회`,
      총수업: `${s.total}회`,
      출석률: `${s.rate}%`,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wsData), "출결상세");

    // 요약 통계 시트 (옵션 체크 시)
    if (includeStats) {
      const statsData = [
        { 항목: "강의명", 값: selectedCourse.name },
        { 항목: "조회 학기", 값: semester },
        { 항목: "평균 출석률", 값: `${monitoringData.attendance}%` },
        { 항목: "총 지각 건수", 값: `${monitoringData.late}건` },
        { 항목: "총 결석 건수", 값: `${monitoringData.absent}건` },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsData), "통계요약");
    }

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `${selectedCourse.name}_학기출결_${today}.xlsx`);
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  const filteredStudents = monitoringData?.students.filter((s) => 
    s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  ) || [];

  if (coursesLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-zinc-300" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">출결 조회</h1>
          <p className="text-sm text-zinc-400 mt-1">강의별 학기 전체 출결 현황입니다.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}학기</option>)}
          </select>
          
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[180px]"
          >
            {courses.map((course) => (
              <option key={course.lectureId} value={course.lectureId}>{course.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 border-t-2 border-primary p-5 shadow-sm">
          <p className="text-xs text-zinc-400 font-medium uppercase">Attendance Rate</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{monitoringData?.attendance || 0}%</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 border-t-2 border-amber-400 p-5 shadow-sm">
          <p className="text-xs text-zinc-400 font-medium uppercase">Total Late</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{monitoringData?.late || 0}건</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 border-t-2 border-rose-400 p-5 shadow-sm">
          <p className="text-xs text-zinc-400 font-medium uppercase">Total Absent</p>
          <p className="text-3xl font-bold text-rose-600 mt-1">{monitoringData?.absent || 0}건</p>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" /> 학기 출결 현황
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름 또는 학번 검색"
              className="pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {dataLoading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></div>
          ) : (
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-medium text-zinc-500 uppercase">
                  <th className="px-6 py-3 font-semibold">학번</th>
                  <th className="px-6 py-3 font-semibold">이름</th>
                  <th className="px-6 py-3 text-center font-semibold">출석</th>
                  <th className="px-6 py-3 text-center font-semibold">지각</th>
                  <th className="px-6 py-3 text-center font-semibold">결석</th>
                  <th className="px-6 py-3 text-center font-semibold">출석률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-sm text-zinc-400">{searchQuery ? "검색 결과가 없습니다" : "학생 데이터가 없습니다"}</td></tr>
                ) : filteredStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-500">{s.studentId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">{s.name}</td>
                    <td className="px-4 py-3 text-center text-sm">{s.present}회</td>
                    <td className="px-4 py-3 text-center text-sm">{s.late}회</td>
                    <td className="px-4 py-3 text-center text-sm text-rose-500 font-medium">{s.absent}회</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.rate >= 80 ? 'bg-primary' : s.rate >= 60 ? 'bg-amber-400' : 'bg-rose-500'}`}
                            style={{ width: `${s.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-800">{s.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>
      </div>

      {/* 내보내기 UI */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" /> 데이터 내보내기
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
            <Download className="w-4 h-4" />
            {selectedCourse?.name || "강의명"}_학기출결.xlsx
          </button>
        </div>
      </div>
    </div>
  );
}