import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Edit, Search, Save } from "lucide-react";
import { toast } from "sonner";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";

const spring = { type: "spring", stiffness: 100, damping: 20 }as const;

const studentsData = [
  { id: 1, name: "김철수", studentId: "20240101", date: "2026-03-10", status: "출석", attendanceRate: 95 },
  { id: 2, name: "이영희", studentId: "20240102", date: "2026-03-10", status: "지각", attendanceRate: 87 },
  { id: 3, name: "박민수", studentId: "20240103", date: "2026-03-10", status: "결석", attendanceRate: 45 },
  { id: 4, name: "정수진", studentId: "20240104", date: "2026-03-10", status: "출석", attendanceRate: 98 },
];

export default function ProfessorAttendanceEdit() {
  const { courses, loading } = useProfessorCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-03-10");

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].name);
    }
  }, [courses, selectedCourse]);

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState(studentsData);
  const [hasChanges, setHasChanges] = useState(false);

  const updateAttendance = (studentId: number, newStatus: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
    setHasChanges(true);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="h-4 w-72 bg-zinc-100 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white rounded-xl border border-zinc-200  h-96 animate-pulse" />
    </div>
  );

  const saveChanges = () => {
    // TODO: Save to server
    toast.success("출결 정보가 저장되었습니다");
    setHasChanges(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "출석":
        return "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark";
      case "지각":
        return "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700";
      case "결석":
        return "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700";
      case "공결":
        return "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700";
      default:
        return "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-700";
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.studentId.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">수동 출결 변경</h1>
        <p className="text-sm text-zinc-400 mt-1">강의 종료 후 출결 상태를 수정할 수 있습니다</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">검색 필터</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">강의 선택</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
              >
                {courses.map((course) => (
                  <option key={course.lectureId} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">날짜</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">학생 검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                <input
                  placeholder="이름 또는 학번"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-primary/10 rounded-xl border border-primary/30 p-5">
        <h2 className="text-sm font-semibold text-primary-dark mb-3">출결 수정 안내</h2>
        <div className="space-y-1.5 text-sm text-primary-dark">
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" /> 출결 수정은 강의 종료 후에만 가능합니다.</p>
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" /> 체류율은 강의 중 얼굴 인식으로 측정된 실제 출석 시간 비율입니다.</p>
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" /> 일반적으로 80% 이상은 출석, 60~80%는 지각, 60% 미만은 결석으로 자동 처리됩니다.</p>
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" /> 변경사항은 반드시 <strong>저장</strong> 버튼을 눌러야 적용됩니다.</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Edit className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 출결 현황
          </h2>
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              onClick={saveChanges}
              className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" strokeWidth={1.5} /> 변경사항 저장
            </motion.button>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">학번</th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">이름</th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">날짜</th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 min-w-[200px]">체류율</th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 text-center">상태</th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">수정</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-zinc-100 last:border-b-0">
                  <td className="px-6 py-4 text-sm text-zinc-800">{student.studentId}</td>
                  <td className="px-6 py-4 text-sm text-zinc-800 font-semibold">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-800">{student.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            student.attendanceRate >= 80 ? "bg-primary" :
                            student.attendanceRate >= 60 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${student.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-zinc-700 min-w-[40px]">{student.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={getStatusBadge(student.status)}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={student.status}
                      onChange={(e) => updateAttendance(student.id, e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                    >
                      <option value="출석">출석</option>
                      <option value="지각">지각</option>
                      <option value="결석">결석</option>
                      <option value="공결">공결</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-400">
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden p-4 space-y-3">
          {filteredStudents.map((student) => (
            <div key={student.id} className="rounded-xl border border-zinc-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{student.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{student.studentId} · {student.date}</p>
                </div>
                <span className={getStatusBadge(student.status)}>{student.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      student.attendanceRate >= 80 ? "bg-primary" :
                      student.attendanceRate >= 60 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${student.attendanceRate}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-700">{student.attendanceRate}%</span>
              </div>
              <select
                value={student.status}
                onChange={(e) => updateAttendance(student.id, e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                <option value="출석">출석</option>
                <option value="지각">지각</option>
                <option value="결석">결석</option>
                <option value="공결">공결</option>
              </select>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-400">검색 결과가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
