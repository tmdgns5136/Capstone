import { useState } from "react";
import { Eye, MessageSquare } from "lucide-react";
import { Pagination } from "../../components/Pagination";

const noticesData = [
  { id: 1, tag: "공지", date: "2023.10.24", title: "중간고사 일정 및 시험 범위 안내", desc: "이번 학기 중간고사는 11월 1일 수요일 오프라인으로 진행됩니다. 챕터 1부터 5까지...", views: 1242, comments: 2 },
  { id: 2, tag: "공지", date: "2023.10.20", title: "제 4주차 알고리즘 실습 보강 안내", desc: "지난 목요일 휴강에 따른 보강이 이번주 금요일 18시에 실습실 A에서 진행될 예정입니다.", views: 856, comments: 0 },
  { id: 3, tag: "공지", date: "2023.10.15", title: "Dynamic Programming 심화 학습 자료 배포", desc: "어려운 DP 알고리즘을 쉽게 이해할 수 있는 시각화 자료를 강의실에 업로드 하였습니다.", views: 531, comments: 1 },
  { id: 4, tag: "공지", date: "2023.10.12", title: "과제 제출 기한 연장 공지 (Assignment #1)", desc: "학생들의 요청으로 첫 번째 과제 제출 기한을 3일 연장합니다. 새로운 기한은 10월 20일까지입니다.", views: 927, comments: 0 },
];

export function ProfessorCourseNotices() {
  const [page, setPage] = useState(1);

  return (
    <div>
      <div className="px-6 py-3 text-sm text-zinc-400 border-b border-zinc-50 flex items-center justify-between">
        <span>총 128개의 게시물</span>
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
      <Pagination currentPage={page} totalPages={4} onPageChange={setPage} className="py-6 border-t border-zinc-100" />
    </div>
  );
}
