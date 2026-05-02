import { useState, useEffect } from "react";
import { Eye, MessageSquare, Megaphone, Loader2, ArrowRight, Edit3 } from "lucide-react";
import { Pagination } from "../../components/Pagination";
import { api } from "../../api/client"; // 기존에 사용하던 api 클라이언트
import { FormModal } from "../../components/FormModal";
import { toast } from "sonner";

// 백엔드 데이터 구조에 맞춘 타입 정의
interface Notice {
  noticeId: number;
  title: string;
  content: string;
  createdDate: string;
  views: number;
  comments: number;
}

export function ProfessorCourseNotices({ lectureId }: { lectureId: number | String }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 공지사항 데이터 불러오기
  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      // 백엔드 ProfessorService.getNotices API 호출
      const response = await api<any>(`/api/professors/lectures/${lectureId}/notices?page=${page}&size=5`);
      
      if (response.success) {
        setNotices(response.data.data);
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("공지사항을 불러오는데 실패했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  // lectureId가 존재할 때만 데이터를 불러오도록 가드(Guard)를 칩니다.
  if (lectureId) {
    fetchNotices();
  } else {
    console.warn("강의 ID(lectureId)가 아직 정의되지 않았습니다.");
    setIsLoading(false);
  }
}, [page, lectureId]);

  useEffect(() => {
  if (selectedNotice) {
    setEditTitle(selectedNotice.title);    // 기존 제목 세팅
    setEditContent(selectedNotice.content); // 기존 내용 세팅
  }
}, [selectedNotice]); // selectedNotice가 바뀔 때마다 이 코드가 실행됩니다.

  const handleUpdate = async () => {
    if (!selectedNotice) return;
    
    try {
      setIsUpdating(true);
      const params = new URLSearchParams();
      params.append("title", editTitle);
      params.append("content", editContent);

      // 백엔드에 수정용 API(/api/professors/notices/{id})가 있다고 가정합니다.
      const response = await api<any>(
        `/api/professors/notices/${selectedNotice.noticeId}?${params.toString()}`,
        { method: 'PATCH' } // 또는 'POST', 백엔드 설정에 맞추세요
      );

      if (response.success) {
        toast.success("공지사항이 수정되었습니다.");
        setSelectedNotice(null); // 모달 닫기
        fetchNotices(); // 목록 새로고침
      }
    } catch (error) {
      toast.error("수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-zinc-400">공지사항 로딩 중...</div>;

  return (
    <div>
      <div className="px-6 py-3 text-sm text-zinc-400 border-b border-zinc-50 flex items-center justify-between">
        <span>총 {totalElements}개의 게시물</span>
      </div>
      
      <div className="divide-y divide-zinc-50">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.noticeId} onClick={() => setSelectedNotice(notice)} className="px-6 py-5 hover:bg-zinc-50/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 uppercase">공지</span>
                <span className="text-xs text-zinc-400">{notice.createdDate}</span>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900 mb-1 group-hover:text-primary transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-zinc-400 truncate">{notice.content}</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {notice.views}
                  </span>
                  {notice.comments > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {notice.comments}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <Megaphone className="w-8 h-8 text-zinc-200" />
            <p className="text-zinc-400 text-sm">등록된 공지사항이 없습니다.</p>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
        className="py-6 border-t border-zinc-100" 
      />

      {/* --- [추가] 2번 보기: 상세 보기 및 수정 모달 --- */}
      <FormModal
        open={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        title="공지사항 상세 및 수정"
        titleIcon={<Edit3 className="w-5 h-5 text-zinc-400" />}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button onClick={() => setSelectedNotice(null)} className="text-sm text-zinc-500 px-4 py-2">닫기</button>
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "수정사항 저장"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">제목</label>
            <input 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">내용</label>
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 text-sm border border-zinc-200 rounded-lg h-48 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            />
          </div>
        </div>
      </FormModal>
      
    </div>
  );
}