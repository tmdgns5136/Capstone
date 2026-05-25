import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";
import { ProfessorCourseAttendance } from "./ProfessorCourseAttendance";
import { ProfessorCourseNotices } from "./ProfessorCourseNotices";
import { ProfessorCourseQA } from "./ProfessorCourseQA";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";

type TabKey = "attendance" | "notices" | "qa";

const tabs: { key: TabKey; label: string }[] = [
  { key: "attendance", label: "출결 관리" },
  { key: "notices", label: "공지사항" },
  { key: "qa", label: "Q&A" },
];

export function ProfessorCourseDetail() {
  // 1. 주소창의 :lectureId (예: "1")를 글자(string) 그대로 가져옵니다.
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabKey>("attendance");
  const currentTime = new Date();
  

  // 2. 전체 강의 목록을 가져옵니다.
  const { courses, loading } = useProfessorCourses();
  
  // 3. 주소창의 글자 ID와 일치하는 강의를 찾습니다. 
  // API의 ID가 숫자일 수도 있으니 String()으로 감싸서 글자끼리 비교하는 게 가장 안전합니다.
  const course = courses.find((c) => String(c.lectureId) === lectureId);

  // 4. [중요] 하얀 화면 방지 로직
  // 데이터를 불러오는 중이거나, 아직 course를 못 찾았다면 로딩 화면을 보여줘야 리액트가 안 죽습니다.
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-20 text-center">
        <p className="text-zinc-500">강의 정보를 찾을 수 없습니다. (ID: {lectureId})</p>
        <button 
          onClick={() => navigate("/professor/courses")}
          className="mt-4 text-zinc-900 font-bold underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button 
            onClick={() => navigate("/professor/courses")} 
            className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> 뒤로가기
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">{course.name}</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> {course.schedule} | {course.room}
          </p>
        </div>
        <div className="text-right">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">LOCAL TIME</p>
            <p className="text-lg font-bold text-zinc-900">
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </p>
          </div>
          <div className="mt-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">TODAY</p>
            <p className="text-lg font-bold text-zinc-900">
              {currentTime.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-zinc-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium relative ${
                activeTab === tab.key ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content: [핵심] 모든 lectureId는 string으로 그대로 넘깁니다. */}
        <div className="p-6">
          {activeTab === "attendance" && (
            <ProfessorCourseAttendance lectureId={lectureId || ""} />
          )}
          {activeTab === "notices" && (
            <ProfessorCourseNotices lectureId={lectureId || ""} />
          )}
          {activeTab === "qa" && (
            <ProfessorCourseQA lectureId={lectureId || ""} />
          )}
        </div>
      </div>

    </div>
  );
}