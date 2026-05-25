import { useState, useEffect, useCallback } from "react";
import { Eye, MessageSquare, Megaphone, Loader2, ArrowRight, Edit3, Plus, Trash2 } from "lucide-react";
import { Pagination } from "../../components/Pagination";
import { api } from "../../api/client"; 
import { FormModal } from "../../components/FormModal";
import { toast } from "sonner";

function formatDate(dt: string) {
  if (!dt) return "";
  return dt.replace("T", " ").replace(/\.\d+$/, "").slice(0, 19);
}

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
  
  // 수정(Update) 관련 상태
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 🌟 [추가] 작성(Create) 관련 상태 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // 공지사항 데이터 불러오기
  const fetchNotices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api<any>(`/api/professors/lectures/${lectureId}/notices?page=${page}&size=5`);
      
      if (response.success) {
        setNotices(response.data.data);
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error("공지사항을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, page]);

  useEffect(() => {
    if (lectureId) {
      fetchNotices();
    } else {
      setIsLoading(false);
    }
  }, [lectureId, fetchNotices]);

  useEffect(() => {
    if (selectedNotice) {
      setEditTitle(selectedNotice.title);    
      setEditContent(selectedNotice.content); 
    }
  }, [selectedNotice]);

  // 🌟 [추가] 공지사항 신규 등록 함수
  const handleCreate = async () => {
    if (!createTitle.trim() || !createContent.trim()) {
      toast.error("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    try {
      setIsCreating(true);
      
      // 백엔드가 @RequestParam 방식이므로 URL 파라미터로 전송
      const params = new URLSearchParams();
      params.append("title", createTitle);
      params.append("content", createContent);

      const response = await api<any>(
        `/api/professors/lectures/${lectureId}/notices?${params.toString()}`,
        { method: "POST" }
      );

      if (response.success) {
        toast.success("공지사항이 등록되었습니다.");
        
        // 폼 초기화 및 모달 닫기
        setCreateTitle("");
        setCreateContent("");
        setIsCreateModalOpen(false);
        
        // 🔥 자동으로 목록 새로고침!
        fetchNotices(); 
      }
    } catch (error) {
      toast.error("공지사항 등록에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  // 공지사항 수정 함수
  const handleUpdate = async () => {
    if (!selectedNotice) return;
    
    try {
      setIsUpdating(true);
      const params = new URLSearchParams();
      params.append("title", editTitle);
      params.append("content", editContent);

      const response = await api<any>(
        `/api/professors/notices/${selectedNotice.noticeId}?${params.toString()}`,
        { method: 'PATCH' }
      );

      if (response.success) {
        toast.success("공지사항이 수정되었습니다.");
        setSelectedNotice(null); 
        fetchNotices(); // 🔥 수정 후에도 자동으로 목록 새로고침!
      }
    } catch (error) {
      toast.error("수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice) return;
    if (!confirm("공지사항을 삭제하시겠습니까?")) return;

    try {
      const response = await api<any>(`/api/professors/notices/${selectedNotice.noticeId}`, { method: "DELETE" });
      if (response.success) {
        toast.success("공지사항이 삭제되었습니다.");
        setSelectedNotice(null);
        fetchNotices();
      }
    } catch (error) {
      toast.error("공지사항 삭제에 실패했습니다.");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-zinc-400">공지사항 로딩 중...</div>;

  return (
    <div>
      {/* 상단 바: 작성 버튼 추가 */}
      <div className="px-6 py-3 text-sm text-zinc-400 border-b border-zinc-50 flex items-center justify-between">
        <span>총 {totalElements}개의 게시물</span>
        {/* 🌟 공지사항 작성 모달을 여는 버튼 */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-zinc-900 text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> 공지 작성
        </button>
      </div>
      
      {/* 공지사항 목록 리스트 */}
      <div className="divide-y divide-zinc-50">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.noticeId} onClick={() => setSelectedNotice(notice)} className="px-6 py-5 hover:bg-zinc-50/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 uppercase">공지</span>
                <span className="text-xs text-zinc-400">{formatDate(notice.createdDate)}</span>
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

      {/* 🌟 [추가] 공지사항 신규 작성용 모달 */}
      <FormModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 공지사항 작성"
        titleIcon={<Plus className="w-5 h-5 text-zinc-400" />}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button onClick={() => setIsCreateModalOpen(false)} className="text-sm text-zinc-500 px-4 py-2">취소</button>
            <button 
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "공지 등록"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">제목</label>
            <input 
              placeholder="공지사항 제목을 입력하세요"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">내용</label>
            <textarea 
              placeholder="공지사항 내용을 입력하세요"
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              className="w-full p-3 text-sm border border-zinc-200 rounded-lg h-48 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            />
          </div>
        </div>
      </FormModal>

      {/* 상세 보기 및 수정 모달 */}
      <FormModal
        open={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        title="공지사항 상세 및 수정"
        titleIcon={<Edit3 className="w-5 h-5 text-zinc-400" />}
        footer={
          <div className="flex justify-between w-full">
            <button
              onClick={handleDelete}
              className="text-sm text-rose-500 hover:text-rose-700 px-4 py-2 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> 삭제
            </button>
            <div className="flex gap-2">
            <button onClick={() => setSelectedNotice(null)} className="text-sm text-zinc-500 px-4 py-2">닫기</button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "수정사항 저장"} <ArrowRight className="w-4 h-4" />
            </button>
            </div>
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