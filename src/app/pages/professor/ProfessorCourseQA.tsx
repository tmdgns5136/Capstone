import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Search, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";

interface ProfessorCourseQAProps {
  lectureId: string;
}

export function ProfessorCourseQA({ lectureId }: ProfessorCourseQAProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

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
    </div>
  );
}