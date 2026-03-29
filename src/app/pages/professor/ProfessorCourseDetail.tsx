import { useState } from "react";
import { ChevronLeft, ArrowRight, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "../../components/FormModal";
import { ProfessorCourseAttendance } from "./ProfessorCourseAttendance";
import { ProfessorCourseNotices } from "./ProfessorCourseNotices";
import { ProfessorCourseQA } from "./ProfessorCourseQA";

interface Course {
  id: number;
  name: string;
  time: string;
  room: string;
  status: string;
}

interface ProfessorCourseDetailProps {
  course: Course;
  onBack: () => void;
}

type TabKey = "attendance" | "notices" | "qa";

const tabs: { key: TabKey; label: string }[] = [
  { key: "attendance", label: "출결 관리" },
  { key: "notices", label: "공지사항" },
  { key: "qa", label: "Q&A" },
];

export function ProfessorCourseDetail({ course, onBack }: ProfessorCourseDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("attendance");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const currentTime = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> 뒤로가기
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">{course.name}</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> {course.time} | {course.room}
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex border-b border-zinc-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium relative ${activeTab === tab.key ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                }`}
            >
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
            </button>
          ))}
          {activeTab === "notices" && (
            <div className="ml-auto flex items-center pr-4">
              <button
                onClick={() => setShowNoticeModal(true)}
                className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800"
              >
                공지사항 작성
              </button>
            </div>
          )}
        </div>

        {activeTab === "attendance" && <ProfessorCourseAttendance />}
        {activeTab === "notices" && <ProfessorCourseNotices />}
        {activeTab === "qa" && <ProfessorCourseQA />}
      </div>

      {/* Notice Write Modal */}
      <FormModal
        open={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        title="공지사항 작성하기"
        titleIcon={<MessageSquare className="w-5 h-5 text-zinc-400" />}
        maxWidth="max-w-lg"
        footer={<>
          <button onClick={() => setShowNoticeModal(false)} className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2">취소</button>
          <button onClick={() => { setShowNoticeModal(false); toast.success("공지사항이 등록되었습니다"); }} className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2">
            등록하기 <ArrowRight className="w-4 h-4" />
          </button>
        </>}
      >
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">제목</label>
          <input placeholder="공지사항 제목" className="w-full rounded-lg border border-zinc-200 p-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">내용</label>
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-100 bg-zinc-50">
              <button className="w-7 h-7 rounded hover:bg-zinc-200 flex items-center justify-center text-xs font-bold">B</button>
              <button className="w-7 h-7 rounded hover:bg-zinc-200 flex items-center justify-center text-xs italic">I</button>
              <button className="w-7 h-7 rounded hover:bg-zinc-200 flex items-center justify-center text-xs">&lt;/&gt;</button>
            </div>
            <textarea className="w-full p-3 text-sm resize-none h-32 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">파일 첨부</label>
          <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 text-center">
            <p className="text-sm text-zinc-500">파일 첨부하기 <span className="text-zinc-400">(최대 10MB)</span></p>
            <p className="text-xs text-zinc-400 mt-1">또는 파일을 여기로 끌어다 놓으세요</p>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
