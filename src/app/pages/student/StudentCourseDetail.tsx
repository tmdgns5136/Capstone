import { useState } from "react";
import { ChevronLeft, ArrowRight, Eye, EyeOff, MessageSquare, Plus, Lock, Trash2 } from "lucide-react";
import { Pagination } from "../../components/Pagination";
import { FormModal } from "../../components/FormModal";
import { FilterTabs } from "../../components/FilterTabs";

interface Course {
  id: number;
  code: string;
  category: string;
  name: string;
  professor: string;
  lectureId?: string;
}

interface StudentCourseDetailProps {
  course: Course;
  onBack: () => void;
}

const noticesData = [
  { id: 1, tag: "공지", date: "2023.10.24", title: "중간고사 일정 및 시험 범위 안내", desc: "이번 학기 중간고사는 11월 1일 수요일 오프라인으로 진행됩니다. 챕터 1부터 5까지...", views: 1242, comments: 2 },
  { id: 2, tag: "공지", date: "2023.10.20", title: "제 4주차 알고리즘 실습 보강 안내", desc: "지난 목요일 휴강에 따른 보강이 이번주 금요일 18시에 실습실 A에서 진행될 예정입니다.", views: 856, comments: 0 },
  { id: 3, tag: "공지", date: "2023.10.15", title: "Dynamic Programming 심화 학습 자료 배포", desc: "어려운 DP 알고리즘을 쉽게 이해할 수 있는 시각화 자료를 강의실에 업로드 하였습니다.", views: 531, comments: 1 },
  { id: 4, tag: "공지", date: "2023.10.12", title: "과제 제출 기한 연장 공지 (Assignment #1)", desc: "학생들의 요청으로 첫 번째 과제 제출 기한을 3일 연장합니다. 새로운 기한은 10월 20일까지입니다.", views: 927, comments: 0 },
];

interface QaItem {
  id: number;
  tag: string;
  date: string;
  title: string;
  desc: string;
  views: number;
  isPrivate: boolean;
  password?: string;
  answer: string | null;
  status: "답변완료" | "대기중";
  isOwn: boolean;
}

const initialQaData: QaItem[] = [
  { id: 1, tag: "시험", date: "2023.10.24", title: "중간고사 강의실 질문드립니다", desc: "중간고사...", views: 1242, isPrivate: false, answer: "공학관 201호에서 진행됩니다.", status: "답변완료", isOwn: false },
  { id: 2, tag: "시험", date: "2023.10.20", title: "중간고사 시험 범위 질문", desc: "중간고사의 시험 범위가 어떻게 되나요?", views: 856, isPrivate: false, answer: null, status: "대기중", isOwn: true },
  { id: 3, tag: "출석", date: "2023.10.15", title: "7주차 수업 온라인 인가요?", desc: "제곤내", views: 531, isPrivate: true, password: "1234", answer: "네, 온라인으로 진행됩니다.", status: "답변완료", isOwn: false },
  { id: 4, tag: "과제", date: "2023.10.12", title: "과제 제출 기한", desc: "과제 제출 기한 연장되었나요?", views: 927, isPrivate: false, answer: null, status: "대기중", isOwn: true },
];

const CATEGORIES = ["시험", "과제", "출석"] as const;

/* ── 4자리 비밀번호 입력 ── */
function PasswordInput({ value, onChange, error, placeholder }: { value: string; onChange: (v: string) => void; error?: boolean; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder={placeholder ?? "숫자 4자리"}
        className={`w-full rounded-lg border p-3 pr-10 text-sm tracking-[0.3em] placeholder:tracking-normal focus:outline-none focus:ring-2 transition-all ${error ? "border-rose-400 focus:ring-rose-200 focus:border-rose-400" : "border-zinc-200 focus:ring-primary/30 focus:border-primary"}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function StudentCourseDetail({ course, onBack }: StudentCourseDetailProps) {
  const [activeTab, setActiveTab] = useState<"notices" | "qa">("notices");
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionCategory, setQuestionCategory] = useState("전체");
  const [page, setPage] = useState(1);
  const [qaList, setQaList] = useState<QaItem[]>(initialQaData);

  // 질문 작성 폼
  const [formCategory, setFormCategory] = useState<string>("시험");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPrivate, setFormPrivate] = useState(false);
  const [formPassword, setFormPassword] = useState("");

  // 비밀글 잠금 해제
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [pendingUnlockId, setPendingUnlockId] = useState<number | null>(null);
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  const isUnlocked = (q: QaItem) => !q.isPrivate || unlockedIds.includes(q.id);

  const handleSubmitQuestion = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    if (formPrivate && formPassword.length !== 4) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
    const newItem: QaItem = {
      id: Date.now(),
      tag: formCategory,
      date: dateStr,
      title: formTitle.trim(),
      desc: formContent.trim(),
      views: 0,
      isPrivate: formPrivate,
      password: formPrivate ? formPassword : undefined,
      answer: null,
      status: "대기중",
      isOwn: true,
    };
    setQaList((prev) => [newItem, ...prev]);
    setFormTitle("");
    setFormContent("");
    setFormCategory("시험");
    setFormPrivate(false);
    setFormPassword("");
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (id: number) => {
    if (!window.confirm("질문을 삭제하시겠습니까?")) return;
    setQaList((prev) => prev.filter((q) => q.id !== id));
  };

  const handleClickQuestion = (q: QaItem) => {
    if (q.isPrivate && !unlockedIds.includes(q.id)) {
      setPendingUnlockId(q.id);
      setUnlockPin("");
      setUnlockError(false);
    }
  };

  const handleUnlockSubmit = () => {
    const target = qaList.find((q) => q.id === pendingUnlockId);
    if (!target) return;
    if (unlockPin === target.password) {
      setUnlockedIds((prev) => [...prev, target.id]);
      setPendingUnlockId(null);
      setUnlockPin("");
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  const isFormValid = formTitle.trim() && formContent.trim() && (!formPrivate || formPassword.length === 4);

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div>
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> 강의 목록으로
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">{course.name}</h1>
        <p className="text-sm text-zinc-400 mt-1">{course.professor} - 2분반</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex border-b border-zinc-100">
          {([
            { key: "notices", label: "공지사항" },
            { key: "qa", label: "Q&A" },
          ] as const).map((tab) => (
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
          {activeTab === "qa" && (
            <div className="ml-auto flex items-center pr-4">
              <button
                onClick={() => setShowQuestionModal(true)}
                className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" /> 질문하기
              </button>
            </div>
          )}
        </div>

        {activeTab === "notices" ? (
          <div>
            <div className="px-6 py-3 text-sm text-zinc-400 border-b border-zinc-50">
              총 128개의 게시물
            </div>
            <div className="divide-y divide-zinc-50">
              {noticesData.map((notice) => (
                <div key={notice.id} className="px-6 py-5 hover:bg-zinc-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">{notice.tag}</span>
                    <span className="text-xs text-zinc-400">{notice.date}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-zinc-900 mb-1">{notice.title}</h3>
                      <p className="text-sm text-zinc-400 truncate">{notice.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {notice.views.toLocaleString()}</span>
                      {notice.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {notice.comments}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={4} onPageChange={setPage} className="py-6" />
          </div>
        ) : (
          <div>
            <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-50">
              <FilterTabs options={["전체", "시험", "과제", "출석"] as const} value={questionCategory} onChange={setQuestionCategory} />
              <span className="text-sm text-zinc-400">총 128개의 게시물</span>
            </div>
            <div className="divide-y divide-zinc-50">
              {qaList.map((q) => {
                const locked = q.isPrivate && !isUnlocked(q);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleClickQuestion(q)}
                    className="px-6 py-5 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">{q.tag}</span>
                      {q.isPrivate && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-white flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> 비밀글
                        </span>
                      )}
                      {q.status === "대기중" && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 animate-pulse">미답변</span>
                      )}
                      <span className="text-xs text-zinc-400">{q.date}</span>
                    </div>
                    {locked ? (
                      <div className="flex items-center gap-3 py-2">
                        <Lock className="w-4 h-4 text-zinc-300" />
                        <span className="text-sm text-zinc-400">비밀글입니다. 클릭하여 비밀번호를 입력하세요.</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-zinc-900 mb-1">{q.title}</h3>
                            <p className="text-sm text-zinc-400 truncate">{q.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="flex items-center gap-1 text-xs text-zinc-400">
                              <Eye className="w-3.5 h-3.5" /> {q.views.toLocaleString()}
                            </span>
                            {q.isOwn && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                className="p-1 rounded hover:bg-rose-50 text-zinc-300 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {q.answer && (
                          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-xs font-semibold text-primary-dark bg-primary/30 px-2 py-0.5 rounded">교수님 답변</span>
                            </div>
                            <p className="text-sm text-zinc-700">{q.answer}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <Pagination currentPage={page} totalPages={4} onPageChange={setPage} className="py-6" />
          </div>
        )}
      </div>

      {/* Question Modal */}
      <FormModal
        open={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="질문하기"
        titleIcon={<MessageSquare className="w-5 h-5 text-zinc-400" />}
        maxWidth="max-w-lg"
        footer={<>
          <button onClick={() => setShowQuestionModal(false)} className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2">취소</button>
          <button
            onClick={handleSubmitQuestion}
            disabled={!isFormValid}
            className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            등록하기 <ArrowRight className="w-4 h-4" />
          </button>
        </>}
      >
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">카테고리</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFormCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${formCategory === cat ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">제목</label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="궁금한 내용의 핵심을 제목으로 적어주세요"
            className="w-full rounded-lg border border-zinc-200 p-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">내용</label>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="질문 내용을 자세히 적어주세요"
            className="w-full rounded-lg border border-zinc-200 p-3 text-sm placeholder:text-zinc-400 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => { setFormPrivate(!formPrivate); if (formPrivate) setFormPassword(""); }}
            className={`w-10 h-6 rounded-full relative transition-colors ${formPrivate ? "bg-zinc-900" : "bg-zinc-200"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formPrivate ? "left-5" : "left-1"}`} />
          </div>
          <span className="text-sm text-zinc-600 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> 비밀글로 등록
          </span>
        </label>
        {formPrivate && (
          <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-medium text-zinc-700 block">비밀번호 (숫자 4자리)</label>
            <PasswordInput value={formPassword} onChange={setFormPassword} placeholder="숫자 4자리를 입력하세요" />
            <p className="text-xs text-zinc-400">나중에 답변을 확인하려면 지금 설정한 비밀번호로만 열람 가능합니다.</p>
          </div>
        )}
      </FormModal>

      {/* Unlock Modal */}
      <FormModal
        open={pendingUnlockId !== null}
        onClose={() => { setPendingUnlockId(null); setUnlockPin(""); setUnlockError(false); }}
        title="비밀글 열람"
        titleIcon={<Lock className="w-5 h-5 text-zinc-400" />}
        maxWidth="max-w-sm"
        footer={<>
          <button onClick={() => { setPendingUnlockId(null); setUnlockPin(""); setUnlockError(false); }} className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2">취소</button>
          <button
            onClick={handleUnlockSubmit}
            disabled={unlockPin.length !== 4}
            className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            확인 <ArrowRight className="w-4 h-4" />
          </button>
        </>}
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-zinc-500">비밀번호 4자리를 입력하세요</p>
          <PasswordInput value={unlockPin} onChange={(v) => { setUnlockPin(v); setUnlockError(false); }} error={unlockError} />
          {unlockError && (
            <p className="text-sm text-rose-500 font-medium">비밀번호가 일치하지 않습니다</p>
          )}
        </div>
      </FormModal>
    </div>
  );
}
