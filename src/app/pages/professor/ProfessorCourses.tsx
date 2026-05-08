import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { getLectures, Lecture } from "../../api/lecture";

export default function ProfessorCourses() {
  const navigate = useNavigate();
  const [semester, setSemester] = useState("2026학년도 1학기");
  const [courses, setCourses] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getLectures(semester)
      .then(res => {
        if (res.success) setCourses(res.data);
        else setError("강의 목록을 불러오지 못했습니다.");
      })
      .catch(() => setError("강의 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [semester]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
    </div>
  );

  if (error) return <div className="p-10 text-center text-rose-500">{error}</div>;

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">해당 학기에 담당 강의가 없습니다.</div>
        ) : (
          courses.map((course) => (
            <div key={course.lectureId} className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{course.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{course.schedule}</p>
              </div>
              <button
                onClick={() => navigate(`/professor/courses/${course.lectureId}`)}
                className="flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shrink-0 w-full sm:w-auto"
              >
                강의실 입장 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}