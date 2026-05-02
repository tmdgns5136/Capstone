import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Search, ChevronRight, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import { FormModal } from "../../components/FormModal";

interface ProfessorCourseQAProps {
  lectureId: string;
}

export function ProfessorCourseQA({ lectureId }: ProfessorCourseQAProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!lectureId) return;
    setLoading(true);
    try {
      // 1. API 호출 (page와 size 필수)
      const response: any = await api(
        `/api/professors/lectures/${lectureId}/questions?page=${page}&size=5`, 
        { method: "GET" }
      );
      
      if (response.success) {
        // [범인 검거 및 수정] 
        // response.data는 { data: [...], totalPages: 1 } 형태이므로, 
        // 진짜 리스트인 response.data.data를 가져와야 합니다.
        setQuestions(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Q&A 로드 에러:", error);
      if (error.status !== 404) {
        toast.error("질의응답을 불러오는데 실패했습니다.");
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [lectureId, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleQuestionClick = async (questionId: number) => {
    try {
      setIsDetailLoading(true);
      const response: any = await api(
        `/api/professors/lectures/${lectureId}/questions/${questionId}`,
        { method: "GET" }
      );
      if (response.success) {
        setSelectedQuestion(response.data);
        // 이미 답변이 있다면 입력창에 채워줍니다.
        setAnswerContent(response.data.answer?.content || "");
      }
    } catch (error) {
      toast.error("질문 상세 내용을 불러오지 못했습니다.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      const isUpdate = !!selectedQuestion.answer;
      
      // 백엔드: @RequestBody Map<String, String>이므로 JSON 객체로 보냅니다.
      const response: any = await api(
        isUpdate 
          ? `/api/professors/answers/${selectedQuestion.questionId}` 
          : `/api/professors/questions/${selectedQuestion.questionId}/answer`,
        {
          method: isUpdate ? "PATCH" : "POST",
          body: JSON.stringify({ content: answerContent }), // JSON 형식!!
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.success) {
        toast.success(isUpdate ? "답변이 수정되었습니다." : "답변이 등록되었습니다.");
        setSelectedQuestion(null);
        fetchQuestions(); // 리스트 갱신
      }
    } catch (error) {
      toast.error("답변 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- [3. 답변 삭제] ---
  const handleAnswerDelete = async () => {
    if (!window.confirm("답변을 삭제하시겠습니까?")) return;

    try {
      setIsSubmitting(true);
      const response: any = await api(
        `/api/professors/answers/${selectedQuestion.questionId}`,
        { method: "DELETE" }
      );
      if (response.success) {
        toast.success("답변이 삭제되었습니다.");
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      toast.error("답변 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // questions가 배열인지 한 번 더 확인하여 에러 방지
  const filteredQuestions = Array.isArray(questions) 
    ? questions.filter((q) =>
        q.title?.includes(searchQuery) || q.studentNum?.includes(searchQuery)
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            placeholder="제목 또는 학번으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900/5"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-300" />
            <p className="text-sm text-zinc-400 mt-2">질문을 불러오는 중...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-12 h-12 text-zinc-100 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">등록된 질문이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filteredQuestions.map((q) => (
              <button
                key={q.questionId}
                onClick={() => handleQuestionClick(q.questionId)}
                className="w-full p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {q.isPrivate && (
                      <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">비밀글</span>
                    )}
                    <h3 className="text-sm font-semibold text-zinc-900">{q.title}</h3>
                    {q.isAnswered ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">답변완료</span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">답변대기</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{q.studentNum}</span>
                    <span>•</span>
                    <span>{q.createdDate}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Q&A 상세 및 답변 모달 */}
      <FormModal
        open={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        title="질문 상세 보기"
        titleIcon={<MessageSquare className="w-5 h-5 text-zinc-400" />}
        footer={
          <div className="flex justify-between items-center w-full">
            {selectedQuestion?.answer ? (
              <button 
                onClick={handleAnswerDelete}
                className="text-red-500 text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> 답변 삭제
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => setSelectedQuestion(null)} className="text-sm text-zinc-500 px-4 py-2">닫기</button>
              <button 
                onClick={handleAnswerSubmit}
                disabled={isSubmitting || !answerContent.trim()}
                className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {selectedQuestion?.answer ? "답변 수정" : "답변 등록"}
              </button>
            </div>
          </div>
        }
      >
        {isDetailLoading ? (
          <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-200" /></div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="bg-zinc-50 rounded-xl p-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Student Question</h4>
              <p className="text-sm font-bold text-zinc-900 mb-2">{selectedQuestion?.title}</p>
              <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{selectedQuestion?.content}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Professor's Answer</label>
              <textarea 
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="답변 내용을 입력하세요..."
                className="w-full p-4 text-sm border border-zinc-200 rounded-xl h-40 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}