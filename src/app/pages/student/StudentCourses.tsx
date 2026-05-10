import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { StudentCourseDetail } from "./StudentCourseDetail";
import { getMyLectures, MyLectureData } from "../../api/studentLecture";
import { CURRENT_YEAR, CURRENT_SEMESTER, SEMESTER_OPTIONS } from "../../constants/semester";

export default function StudentCourses() {
  const [semester, setSemester] = useState(CURRENT_SEMESTER);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [courses, setCourses] = useState<MyLectureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<MyLectureData | null>(null);

  useEffect(() => {
    setLoading(true);
    getMyLectures(year, semester)
      .then((res) => {
        setCourses(res.data);
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, [year, semester]);

  if (selectedCourse) {
    return (
      <StudentCourseDetail
        course={{
          id: Number(selectedCourse.lectureId) || 0,
          code: "",
          category: "",
          name: selectedCourse.lectureName,
          professor: selectedCourse.professorName,
          lectureId: selectedCourse.lectureId,
        }}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const semesterLabel = `${year}학년도 ${semester}`;

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
            value={`${year}-${semester}`}
            onChange={(e) => {
              const [y, s] = e.target.value.split("-");
              setYear(Number(y));
              setSemester(s);
            }}
            className="appearance-none cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {SEMESTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={`${opt.value.split("-")[0]}-${opt.value.split("-")[1] === "1" ? "1학기" : "2학기"}`}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-sm text-zinc-400">
          {semesterLabel}에 수강 중인 강의가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.lectureId} className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{course.lectureName}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{course.professorName}</p>
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
      )}
    </div>
  );
}
