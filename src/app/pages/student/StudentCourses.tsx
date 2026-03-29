import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { StudentCourseDetail } from "./StudentCourseDetail";

const coursesData = [
  { id: 1, code: "CS-201", category: "전공필수", name: "알고리즘", professor: "임정택 교수" },
  { id: 2, code: "CS-301", category: "전공선택", name: "인터페이스 디자인", professor: "김철수 교수" },
  { id: 3, code: "CS-204", category: "전공필수", name: "데이터 시각화", professor: "엠마 왓슨 교수" },
  { id: 4, code: "CS-302", category: "전공필수", name: "데이터 베이스", professor: "마이클 첸 교수" },
  { id: 5, code: "GE-101", category: "교양", name: "창의적 사고", professor: "박지성 교수" },
  { id: 6, code: "CS-401", category: "전공선택", name: "네트워크 보안", professor: "이영희 교수" },
  { id: 7, code: "CS-490", category: "전공필수", name: "캡스톤 디자인", professor: "임정택 교수" },
];

export default function StudentCourses() {
  const [semester, setSemester] = useState("2026학년도 1학기");
  const [selectedCourse, setSelectedCourse] = useState<typeof coursesData[0] | null>(null);

  if (selectedCourse) {
    return <StudentCourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">내 강의</h1>
          <p className="text-sm text-zinc-400 mt-1">현재 수강 중인 강의 목록입니다.</p>
        </div>
        <div className="relative self-start">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="appearance-none cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>2026학년도 1학기</option>
            <option>2025학년도 2학기</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {coursesData.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md border border-zinc-200 text-xs font-medium text-zinc-600">{course.code}</span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-600">{course.category}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{course.name}</h3>
              <p className="text-sm text-zinc-400 mt-0.5">{course.professor}</p>
            </div>
            <button
              onClick={() => setSelectedCourse(course)}
              className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors shrink-0 w-full sm:w-auto"
            >
              강의실 입장 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
