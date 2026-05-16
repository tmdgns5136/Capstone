import { useState } from "react";
// react-router-dom 대신 react-router를 사용하신다고 하셔서 그에 맞췄습니다.
import { useParams, useNavigate } from "react-router"; 
import { ChevronLeft, ArrowRight, MessageSquare, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "../../components/FormModal";
import { ProfessorCourseAttendance } from "./ProfessorCourseAttendance";
import { ProfessorCourseNotices } from "./ProfessorCourseNotices";
import { ProfessorCourseQA } from "./ProfessorCourseQA";
import { useProfessorCourses } from "../../hooks/useProfessorCourses";
import { api } from "../../api/client";

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
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // [추가] 공지사항 작성을 위한 상태값
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 목록 새로고침용

  // [추가] 실제 백엔드 DB에 저장하는 함수 (백엔드 @RequestParam 방식 대응)
  const handleSaveNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 백엔드 컨트롤러가 @RequestParam을 쓰므로 URL 파라미터 방식으로 생성
      const params = new URLSearchParams();
      params.append("title", noticeTitle);
      params.append("content", noticeContent);

      const response = await api<any>(
        `/api/professors/lectures/${lectureId}/notices?${params.toString()}`, 
        { method: 'POST' } // 두 번째 인자로 POST 메서드를 명시해줍니다.
      );

      if (response.success) {
        toast.success("공지사항이 성공적으로 등록되었습니다.");
        setShowNoticeModal(false);
        setNoticeTitle(""); // 입력창 초기화
        setNoticeContent(""); // 입력창 초기화
        setRefreshTrigger(prev => prev + 1); // [중요] 목록 컴포넌트에게 새로고침 신호 보냄
      }
    } catch (error) {
      toast.error("서버 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };
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

      {/* Notice Write Modal */}
      <FormModal
        open={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        title="공지사항 작성하기"
        titleIcon={<MessageSquare className="w-5 h-5 text-zinc-400" />}
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button 
              onClick={() => setShowNoticeModal(false)} 
              className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2"
            >
              취소
            </button>
            <button 
              onClick={handleSaveNotice} // [변경] 실제 저장 함수 연결
              disabled={isSubmitting}
              className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2"
            >
              등록하기 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">제목</label>
            <input 
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="공지사항 제목" 
              className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">내용</label>
            <textarea 
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="내용을 입력하세요"
              className="w-full p-3 text-sm border border-zinc-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}