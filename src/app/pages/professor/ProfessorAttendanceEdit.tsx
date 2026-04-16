import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Edit, Search, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
// 우리가 만든 API 함수들 가져오기
import { getAttendanceMonitoring, updateAttendance, AttendanceStatus } from "../../api/attendance";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

// 1. 상태값 매핑 정의 (백엔드 <-> 프론트엔드)
const STATUS_MAP: Record<AttendanceStatus, { label: string; color: string }> = {
  ATTENDANCE: { label: "출석", color: "bg-primary/10 text-primary-dark" },
  LATE: { label: "지각", color: "bg-amber-50 text-amber-700" },
  ABSENT: { label: "결석", color: "bg-rose-50 text-rose-700" },
  EXCUSED: { label: "공결", color: "bg-sky-50 text-sky-700" },
};

export default function ProfessorAttendanceEdit() {
  const { courses, loading: coursesLoading } = useProfessorCourses();

  // 상태 관리
  const [selectedLectureId, setSelectedLectureId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. 데이터 불러오기 함수 (9번 명세 활용)
  const fetchAttendanceData = useCallback(async () => {
    if (!selectedLectureId) return;
    setLoading(true);
    try {
      // 날짜 파라미터를 담아 해당 날짜의 리스트를 가져옵니다.
      const response = await getAttendanceMonitoring(selectedLectureId, { date: selectedDate });
      if (response.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      toast.error("출결 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedLectureId, selectedDate]);

  // 초기 강의 설정 및 변경 시 데이터 로드
  useEffect(() => {
    if (courses.length > 0 && !selectedLectureId) {
      setSelectedLectureId(courses[0].lectureId);
    }
  }, [courses, selectedLectureId]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // 3. 수동 출결 변경 처리 (8번 명세 활용)
  const handleStatusChange = async (studentId: string, newStatus: AttendanceStatus) => {
    try {
      const response = await updateAttendance({
        studentId,
        lectureId: selectedLectureId,
        status: newStatus,
      });

      if (response.success) {
        toast.success(response.message || "출결 상태가 변경되었습니다.");
        // 목록 새로고침 없이 로컬 상태만 업데이트해서 반응속도 높이기
        setStudents(prev =>
          prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s)
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "변경에 실패했습니다.");
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const config = STATUS_MAP[status] || STATUS_MAP.ABSENT;
    return `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`;
  };

  const filteredStudents = students.filter(
    (s) => s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  );

  if (coursesLoading) return <div className="p-10 text-center">강의 목록 로딩 중...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">수동 출결 변경</h1>
          <p className="text-sm text-zinc-400 mt-1">특정 날짜의 출결 상태를 즉시 수정할 수 있습니다</p>
        </div>
        <button
          onClick={fetchAttendanceData}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
          title="새로고침"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">강의 선택</label>
            <select
              value={selectedLectureId}
              onChange={(e) => setSelectedLectureId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {courses.map((course) => (
                <option key={course.lectureId} value={course.lectureId}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">날짜 선택</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">학생 검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                placeholder="이름 또는 학번"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Edit className="w-4 h-4 text-zinc-400" /> {selectedDate} 출결 현황
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-zinc-400">데이터를 불러오는 중...</div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">학번</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">이름</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">누적 출석률</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase text-center">현재 상태</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">수동 변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-600">{student.studentId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${student.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-500">{student.rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={getStatusBadge(student.status)}>
                        {STATUS_MAP[student.status as AttendanceStatus]?.label || "미정"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(student.studentId, e.target.value as AttendanceStatus)}
                        className="rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                      >
                        <option value="ATTENDANCE">출석</option>
                        <option value="LATE">지각</option>
                        <option value="ABSENT">결석</option>
                        <option value="EXCUSED">공결</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredStudents.length === 0 && (
            <div className="py-20 text-center text-zinc-400 text-sm">표시할 학생 데이터가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}