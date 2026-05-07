import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ArrowRight, MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { Pagination } from "../../components/Pagination";
import { FormModal } from "../../components/FormModal";
import {
  getLectureNotices,
  getLectureNoticeDetail,
  getQuestions,
  getQuestionDetail,
  createQuestion,
  deleteQuestion as deleteQuestionApi,
  type NoticeData,
  type NoticeDetailData,
  type QuestionData,
  type QuestionDetailData,
} from "../../api/studentLecture";

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

export function StudentCourseDetail({ course, onBack }: StudentCourseDetailProps) {
  const lectureId = course.lectureId || String(course.id);

  const [activeTab, setActiveTab] = useState<"notices" | "qa">("notices");
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 공지사항 state
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [noticeTotalPages, setNoticeTotalPages] = useState(1);
  const [noticeTotalElements, setNoticeTotalElements] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetailData | null>(null);

  // Q&A state
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [qaTotalPages, setQaTotalPages] = useState(1);
  const [qaTotalElements, setQaTotalElements] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetailData | null>(null);

  // 질문 작성 폼
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPrivate, setFormPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 공지사항 불러오기
  const fetchNotices = useCallback(() => {
    setLoading(true);
    getLectureNotices(lectureId, page - 1, 10)
      .then((res) => {
        const pageData = res.data;
        setNotices(Array.isArray(pageData) ? pageData : pageData?.content ?? []);
        setNoticeTotalPages(res.totalPages ?? pageData?.totalPages ?? 1);
        setNoticeTotalElements(res.totalElements ?? pageData?.totalElements ?? 0);
      })
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, [lectureId, page]);

  // Q&A 불러오기
  const fetchQuestions = useCallback(() => {
    setLoading(true);
    getQuestions(lectureId, page - 1, 10)
      .then((res) => {
        const pageData = res.data;
        setQuestions(Array.isArray(pageData) ? pageData : pageData?.content ?? []);
        setQaTotalPages(res.totalPages ?? pageData?.totalPages ?? 1);
        setQaTotalElements(res.totalElements ?? pageData?.totalElements ?? 0);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [lectureId, page]);

  useEffect(() => {
    setPage(1);
    setSelectedNotice(null);
    setSelectedQuestion(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "notices") fetchNotices();
    else fetchQuestions();
  }, [activeTab, page, fetchNotices, fetchQuestions]);

  // 공지사항 상세
  const handleNoticeClick = (noticeId: number) => {
    getLectureNoticeDetail(lectureId, noticeId)
      .then((res) => setSelectedNotice(res.data))
      .catch(() => {});
  };

  // Q&A 상세
  const handleQuestionClick = (questionId: number) => {
    getQuestionDetail(lectureId, questionId)
      .then((res) => setSelectedQuestion(res.data))
      .catch(() => {});
  };

  // 질문 작성
  const handleSubmitQuestion = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSubmitting(true);
    createQuestion(lectureId, {
      title: formTitle.trim(),
      content: formContent.trim(),
      isPrivate: formPrivate,
    })
      .then(() => {
        setFormTitle("");
        setFormContent("");
        setFormPrivate(false);
        setShowQuestionModal(false);
        fetchQuestions();
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  // 질문 삭제
  const handleDeleteQuestion = (questionId: number) => {
    if (!window.confirm("질문을 삭제하시겠습니까?")) return;
    deleteQuestionApi(lectureId, questionId)
      .then(() => {
        setSelectedQuestion(null);
        fetchQuestions();
      })
      .catch(() => {});
  };

  const isFormValid = formTitle.trim() && formContent.trim();

  // 공지사항 상세 뷰
  if (selectedNotice) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedNotice(null)} className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> 목록으로
        </button>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">{selectedNotice.title}</h2>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-6">
            <span>{selectedNotice.createdDate}</span>
            <span>조회 {selectedNotice.views}</span>
          </div>
          <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</div>
        </div>
      </div>
    );
  }

  // Q&A 상세 뷰
  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedQuestion(null)} className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> 목록으로
        </button>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-zinc-900">{selectedQuestion.title}</h2>
            <button
              onClick={() => handleDeleteQuestion(selectedQuestion.questionId)}
              className="p-2 rounded-lg hover:bg-rose-50 text-zinc-300 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-6">
            <span>{selectedQuestion.createdDate}</span>
            <span>조회 {selectedQuestion.views}</span>
            {selectedQuestion.isPrivate && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-white">비밀글</span>
            )}
          </div>
          <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap mb-6">{selectedQuestion.content}</div>
          {selectedQuestion.answer ? (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary-dark bg-primary/30 px-2 py-0.5 rounded">
                  {selectedQuestion.answer.professorName} 교수님 답변
                </span>
                <span className="text-xs text-zinc-400">{selectedQuestion.answer.answeredDate}</span>
              </div>
              <p className="text-sm text-zinc-700">{selectedQuestion.answer.content}</p>
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 rounded-lg text-sm text-zinc-400 text-center">
              아직 답변이 등록되지 않았습니다.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div>
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> 강의 목록으로
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">{course.name}</h1>
        <p className="text-sm text-zinc-400 mt-1">{course.professor}</p>
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
              className={`px-6 py-4 text-sm font-medium relative ${activeTab === tab.key ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : activeTab === "notices" ? (
          <div>
            <div className="px-6 py-3 text-sm text-zinc-400 border-b border-zinc-50">
              총 {noticeTotalElements}개의 게시물
            </div>
            {notices.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-400">등록된 공지사항이 없습니다.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {notices.map((notice) => (
                  <div
                    key={notice.noticeId}
                    onClick={() => handleNoticeClick(notice.noticeId)}
                    className="px-6 py-5 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">공지</span>
                      <span className="text-xs text-zinc-400">{notice.createdDate}</span>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900">{notice.title}</h3>
                  </div>
                ))}
              </div>
            )}
            {noticeTotalPages > 1 && (
              <Pagination currentPage={page} totalPages={noticeTotalPages} onPageChange={setPage} className="py-6" />
            )}
          </div>
        ) : (
          <div>
            <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-50">
              <span className="text-sm text-zinc-400">총 {qaTotalElements}개의 게시물</span>
            </div>
            {questions.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-400">등록된 질문이 없습니다.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {questions.map((q) => (
                  <div
                    key={q.questionId}
                    onClick={() => handleQuestionClick(q.questionId)}
                    className="px-6 py-5 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {q.isPrivate && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-white">비밀글</span>
                      )}
                      {q.isAnswered ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary-dark">답변완료</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">미답변</span>
                      )}
                      <span className="text-xs text-zinc-400">{q.createdDate}</span>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900">{q.title}</h3>
                  </div>
                ))}
              </div>
            )}
            {qaTotalPages > 1 && (
              <Pagination currentPage={page} totalPages={qaTotalPages} onPageChange={setPage} className="py-6" />
            )}
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
            disabled={!isFormValid || submitting}
            className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>등록하기 <ArrowRight className="w-4 h-4" /></>}
          </button>
        </>}
      >
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
            onClick={() => setFormPrivate(!formPrivate)}
            className={`w-10 h-6 rounded-full relative transition-colors ${formPrivate ? "bg-zinc-900" : "bg-zinc-200"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formPrivate ? "left-5" : "left-1"}`} />
          </div>
          <span className="text-sm text-zinc-600">비밀글로 등록</span>
        </label>
      </FormModal>
    </div>
  );
}
