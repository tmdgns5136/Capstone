import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Download, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { getAttendanceMonitoring, StudentAttendanceDetail } from "../../api/attendance";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export default function ProfessorExport() {
  const { courses, loading } = useProfessorCourses();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [students, setStudents] = useState<StudentAttendanceDetail[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].lectureId);
      setSelectedCourseName(courses[0].name);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const res = await getAttendanceMonitoring(selectedCourseId);
        if (res.success && res.data?.students) {
          setStudents(res.data.students);
        } else {
          setStudents([]);
        }
      } catch {
        setStudents([]);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [selectedCourseId]);

  const handleCourseChange = (lectureId: string) => {
    setSelectedCourseId(lectureId);
    const course = courses.find((c) => c.lectureId === lectureId);
    setSelectedCourseName(course?.name || "");
  };

  const exportToExcel = () => {
    if (!selectedCourseId) {
      toast.error("강의를 선택해주세요");
      return;
    }
    if (students.length === 0) {
      toast.error("내보낼 출결 데이터가 없습니다");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Main data sheet
    const wsData = students.map((s) => ({
      학번: s.studentId,
      이름: s.name,
      출석: s.present,
      지각: s.late,
      결석: s.absent,
      총수업: s.total,
      "출석률(%)": s.rate,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "출결데이터");

    // Stats sheet
    if (includeStats) {
      const totalStudents = students.length;
      const avgRate = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.rate, 0) / totalStudents).toFixed(1) : "0";
      const avgPresent = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.present, 0) / totalStudents).toFixed(1) : "0";
      const avgLate = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.late, 0) / totalStudents).toFixed(1) : "0";
      const avgAbsent = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.absent, 0) / totalStudents).toFixed(1) : "0";

      const statsData = [
        { 항목: "총 수강생", 값: `${totalStudents}명` },
        { 항목: "평균 출석률", 값: `${avgRate}%` },
        { 항목: "평균 출석", 값: `${avgPresent}회` },
        { 항목: "평균 지각", 값: `${avgLate}회` },
        { 항목: "평균 결석", 값: `${avgAbsent}회` },
      ];
      const wsStats = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, "통계");
    }

    // Export
    XLSX.writeFile(wb, `${selectedCourseName}_출결데이터_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("엑셀 파일이 다운로드되었습니다");
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="h-4 w-72 bg-zinc-100 rounded-lg animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 h-96 animate-pulse" />
        <div className="bg-white rounded-xl border border-zinc-200 h-96 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">데이터 내보내기</h1>
        <p className="text-sm text-zinc-400 mt-1">출결 데이터를 엑셀 파일로 내보내세요</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Export Settings */}
        <div className="bg-white rounded-xl border border-zinc-200  overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 내보내기 설정
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">강의 선택</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer"
                >
                  {courses.map((course) => (
                    <option key={course.lectureId} value={course.lectureId}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">포함할 데이터</label>
                <div className="space-y-2 bg-zinc-50 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-zinc-700 hover:text-zinc-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeDetails}
                      onChange={(e) => setIncludeDetails(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-primary-dark focus:ring-primary/30"
                    />
                    <span className="font-medium">상세 출결 데이터</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-sm text-zinc-700 hover:text-zinc-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeStats}
                      onChange={(e) => setIncludeStats(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-primary-dark focus:ring-primary/30"
                    />
                    <span className="font-medium">통계 요약</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={exportToExcel}
              disabled={dataLoading || students.length === 0}
              className="mt-6 w-full bg-primary text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} /> 엑셀로 내보내기
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">미리보기</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
                <h3 className="text-sm font-semibold text-primary-dark mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/30 text-primary-dark text-xs font-semibold">1</span>
                  출결 데이터 시트
                </h3>
                <ul className="text-sm text-primary-dark space-y-1.5">
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" /> 학번, 이름</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" /> 출석, 지각, 결석 횟수</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" /> 총수업 및 출석률</li>
                </ul>
              </div>

              {includeStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={spring}
                  className="p-4 bg-sky-50 rounded-xl border border-sky-100"
                >
                  <h3 className="text-sm font-semibold text-sky-800 mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-200 text-sky-800 text-xs font-semibold">2</span>
                    통계 시트
                  </h3>
                  <ul className="text-sm text-sky-700 space-y-1.5">
                    <li className="flex items-center gap-2"><span className="w-1 h-1 bg-sky-400 rounded-full" /> 총 수강생 및 평균 출석률</li>
                    <li className="flex items-center gap-2"><span className="w-1 h-1 bg-sky-400 rounded-full" /> 평균 출석/지각/결석 횟수</li>
                  </ul>
                </motion.div>
              )}

              <div className="p-4 bg-zinc-50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">예상 파일명</p>
                  <p className="text-sm text-zinc-700 font-medium break-all">
                    {selectedCourseName || "강의명"}_출결데이터_{new Date().toISOString().split("T")[0]}.xlsx
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">출결 데이터 ({students.length}명)</h2>
        </div>

        {dataLoading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400 mx-auto" />
            <p className="text-sm text-zinc-400 mt-2">데이터를 불러오는 중...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-400">
            출결 데이터가 없습니다
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">학번</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">이름</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 text-center">출석</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 text-center">지각</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 text-center">결석</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 text-center">출석률</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.studentId} className="border-b border-zinc-100 last:border-b-0">
                      <td className="px-6 py-4 text-sm text-zinc-800">{student.studentId}</td>
                      <td className="px-6 py-4 text-sm text-zinc-800 font-semibold">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">{student.present}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">{student.late}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">{student.absent}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-800 text-center font-medium">{student.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden p-4 space-y-3">
              {students.map((student) => (
                <div key={student.studentId} className="rounded-xl border border-zinc-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{student.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{student.studentId}</p>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700">{student.rate}%</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">출석 {student.present}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">지각 {student.late}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">결석 {student.absent}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-6">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">내보내기 안내</h2>
        <div className="space-y-3 text-sm text-zinc-600">
          <p className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">1</span>
            엑셀 파일은 성적 입력 시스템에 바로 업로드할 수 있는 형식입니다.
          </p>
          <p className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">2</span>
            출석률은 (출석) / (총수업) x 100으로 계산됩니다.
          </p>
          <p className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">3</span>
            데이터는 현재까지 진행된 수업의 출결 정보를 포함합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
