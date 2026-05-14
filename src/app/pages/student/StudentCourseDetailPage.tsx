import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StudentCourseDetail } from "./StudentCourseDetail";
import { getMyLectures, MyLectureData } from "../../api/studentLecture";

export default function StudentCourseDetailPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<MyLectureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lectureId) return;
    const now = new Date();
    const year = now.getFullYear();
    const semester = now.getMonth() + 1 >= 7 ? "2" : "1";
    getMyLectures(year, semester)
      .then((res) => {
        const found = res.data.find((l) => String(l.lectureId) === String(lectureId));
        setCourse(found || null);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [lectureId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-sm text-zinc-400">
        강의를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <StudentCourseDetail
      course={{
        id: Number(course.lectureId) || 0,
        code: "",
        category: "",
        name: course.lectureName,
        professor: course.professorName,
        lectureId: course.lectureId,
      }}
      onBack={() => navigate("/student/courses")}
    />
  );
}
