import { useState } from "react";
import { Lock, Send, Edit2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const initialQAData = [
  { id: 1, author: "익명", question: "SQL JOIN에 대해 질문있습니다", answer: null as string | null, isPrivate: false, date: "2026-03-11", status: "미답변" as const },
  { id: 2, author: "익명", question: "중간고사 범위가 어떻게 되나요?", answer: "챕터 1~5까지입니다.", isPrivate: false, date: "2026-03-12", status: "답변완료" as const },
  { id: 3, author: "익명", question: "React Hook 사용법 문의", answer: "useState와 useEffect를 참고하세요.", isPrivate: true, date: "2026-03-12", status: "답변완료" as const },
];

export function ProfessorCourseQA() {
  const [qaData] = useState(initialQAData);
  const [answerText, setAnswerText] = useState("");
  const [answeringFor, setAnsweringFor] = useState<number | null>(null);

  const handleAnswerQuestion = (questionId: number) => {
    if (!answerText.trim()) {
      toast.error("답변을 입력해주세요");
      return;
    }
    toast.success("답변이 등록되었습니다");
    setAnswerText("");
    setAnsweringFor(null);
  };

  if (qaData.length === 0) {
    return (
      <div className="p-6 text-center py-16">
        <MessageSquare className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">등록된 질문이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-3 text-sm text-zinc-400 border-b border-zinc-50">
        학생 질문 목록
      </div>
      <div className="divide-y divide-zinc-50">
        {qaData.map((q) => (
          <div key={q.id} className="px-6 py-5">
            {/* Question header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">{q.author}</span>
              {q.isPrivate && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-white flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> 비밀글
                </span>
              )}
              {!q.answer && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 animate-pulse">미답변</span>
              )}
              <span className="text-xs text-zinc-400">{q.date}</span>
            </div>

            <h4 className="text-base font-semibold text-zinc-900 mb-3">{q.question}</h4>

            {q.answer ? (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary-dark bg-primary/30 px-2 py-0.5 rounded">내 답변</span>
                  <div className="flex gap-1">
                    <button className="text-xs text-zinc-400 hover:text-zinc-600 px-2 py-1 rounded hover:bg-zinc-100">수정</button>
                    <button className="text-xs text-zinc-400 hover:text-rose-500 px-2 py-1 rounded hover:bg-zinc-100">삭제</button>
                  </div>
                </div>
                <p className="text-sm text-zinc-700">{q.answer}</p>
              </div>
            ) : (
              <div>
                {answeringFor === q.id ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 mb-1 block flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> 답변 작성
                      </label>
                      <textarea
                        placeholder="답변을 입력하세요..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-zinc-200 p-3 text-sm resize-none placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setAnsweringFor(null); setAnswerText(""); }}
                        className="text-sm text-zinc-500 px-4 py-2 hover:text-zinc-700"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleAnswerQuestion(q.id)}
                        className="bg-zinc-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-zinc-800"
                      >
                        답변 등록
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAnsweringFor(q.id)}
                    className="mt-2 w-full bg-zinc-100 text-zinc-700 text-sm font-medium py-3 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> 이 질문에 답변하기
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
