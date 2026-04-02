import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { ProfessorCourseDetail } from "./ProfessorCourseDetail";
import { useProfessorCourses, Course } from "../../hooks/useProfessorCourses";

export default function ProfessorCourses() {
  const location = useLocation();
  const navigate = useNavigate();
  const [semester, setSemester] = useState("2026학년도 1학기");
  
  const { courses, loading, error } = useProfessorCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const fromHome = !!(location.state as { lectureId?: string } | null)?.lectureId;

  useEffect(() => {
    const lectureId = (location.state as { lectureId?: string } | null)?.lectureId;
   
    if (lectureId && courses.length > 0) {
      const found = courses.find((c) => c.lectureId === lectureId);
      if (found) setSelectedCourse(found);
    }
  }, [location.state, courses]);

  const handleBack = () => {
    if (fromHome) {
      navigate("/professor");
    } else {
      setSelectedCourse(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }
  if (error) {
    return <div className="p-10 text-center text-rose-500">{error}</div>;
  }

  if (selectedCourse) {
    return (
      <ProfessorCourseDetail
        course={selectedCourse}
        onBack={handleBack}
      />
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">내 강의</h1>
          <p className="text-sm text-zinc-400 mt-1">담당중인 강의 목록입니다.</p>
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
        {courses.map((course) => (
          <div key={course.lectureId} className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
            <div>
              {course.status && (
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 mb-2">
                  {course.status === "IN_PROGRESS" ? "수업 진행 중" : course.status}
                </span>
              )}
              <h3 className="text-lg font-bold text-zinc-900">{course.name}</h3>
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
