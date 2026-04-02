import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Calendar, MoreHorizontal, ArrowRight, AlertCircle, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollableCardList } from "../../components/ScrollableCardList";
import { ATTENDANCE_STATUS_COLORS } from "../../constants/attendance";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { FilterTabs } from "../../components/FilterTabs";
import { FormModal } from "../../components/FormModal";
import { PageHeader } from "../../components/PageHeader";
import { useAppealRequests } from "../../hooks/useAppealRequests";

const coursesSummary = [
  { name: "알고리즘", professor: "임정택 교수님", rate: 95 },
  { name: "인터페이스 디자인", professor: "김철수 교수님", rate: 90 },
  { name: "데이터 시각화", professor: "엠마 왓슨 교수님", rate: 85 },
  { name: "데이터 베이스", professor: "마이클 첸 교수님", rate: 100 },
  { name: "창의적 사고", professor: "박지성 교수님", rate: 88 },
  { name: "네트워크 보안", professor: "이영희 교수님", rate: 92 },
  { name: "캡스톤 디자인", professor: "임정택 교수님", rate: 78 },
];

const detailedRecords = [
  { date: "2026.05.19 (월)", course: "알고리즘", status: "출석" as const, note: "정상 인증" },
  { date: "2026.05.19 (월)", course: "인터페이스 디자인", status: "출석" as const, note: "정상 인증" },
  { date: "2026.05.16 (금)", course: "창의적 사고", status: "결석" as const, note: "-" },
  { date: "2026.05.14 (수)", course: "데이터 베이스", status: "출석" as const, note: "정상 인증" },
  { date: "2026.05.12 (월)", course: "데이터 시각화", status: "출석" as const, note: "정상 인증" },
];

export default function StudentStats() {
  const navigate = useNavigate();
  const [semester, setSemester] = useState("2026년 1학기");
  const [filter, setFilter] = useState<"전체" | "출석" | "결석">("전체");
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealRecord, setAppealRecord] = useState<{ course: string; date: string } | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const { requests: appealRequests, addRequest: addAppeal, deleteRequest: deleteAppeal } = useAppealRequests();

  // 현재 학생(강신우)의 이의신청 내역만 필터
  const myAppeals = appealRequests.filter((r) => r.studentId === "20240201");
  const [page, setPage] = useState(1);
  const [scrollPage] = useState(() => {
    const saved = sessionStorage.getItem("statsScrollPage");
    return saved ? parseInt(saved, 10) : 0;
  });
  const handleScrollPageChange = useCallback((p: number) => {
    sessionStorage.setItem("statsScrollPage", String(p));
  }, []);

  const filteredRecords = filter === "전체"
    ? detailedRecords
    : detailedRecords.filter((r) => r.status === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="출석 현황"
        description="2026학년도 1학기 실시간 출결 현황입니다."
        actions={
          <button className="flex items-center gap-2 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <Calendar className="w-4 h-4" /> {semester}
          </button>
        }
      />

      {/* 학기별 출결 요약 */}
      <section>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">학기별 출결 요약</h2>
        <ScrollableCardList initialPage={scrollPage} onPageChange={handleScrollPageChange}>
          {coursesSummary.map((course, index) => (
            <div
              key={course.name}
              onClick={() => navigate(`/student/stats/${index + 1}`)}
              className="bg-white rounded-xl border border-zinc-200 p-5 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group min-w-[80%] sm:min-w-[calc(50%-8px)] lg:min-w-[calc(25%-12px)] flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-zinc-900">{course.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-zinc-900">{course.rate}%</span>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-3">{course.professor}</p>
              <ProgressBar value={course.rate} className="mb-1" />
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">ATTENDANCE RATE</p>
            </div>
          ))}
        </ScrollableCardList>
      </section>

      {/* 상세 출결 내역 + 이의 신청 내역 (좌우 배치) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">

        {/* 좌: 상세 출결 내역 (7/12) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-4">
            <h2 className="text-lg font-bold text-zinc-900">상세 출결 내역</h2>
            <FilterTabs options={["전체", "출석", "결석"] as const} value={filter} onChange={setFilter} />
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-3">
            {filteredRecords.map((record, i) => (
              <div key={i} className="bg-zinc-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-900">{record.course}</span>
                  <StatusBadge status={record.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{record.date}</span>
                  {record.status === "결석" ? (
                    <button
                      onClick={() => { setAppealRecord({ course: record.course, date: record.date }); setShowAppealModal(true); }}
                      className="text-xs font-medium bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-800"
                    >
                      이의 신청
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-400">{record.note}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">날짜</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">강의명</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">상태</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">비고</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredRecords.map((record, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-zinc-600 whitespace-nowrap">{record.date}</td>
                    <td className="px-5 py-4 text-sm font-medium text-zinc-900">{record.course}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400">{record.note}</td>
                    <td className="px-5 py-4 text-right">
                      {record.status === "결석" ? (
                        <button
                          onClick={() => { setAppealRecord({ course: record.course, date: record.date }); setShowAppealModal(true); }}
                          className="text-xs font-medium bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-800"
                        >
                          이의 신청
                        </button>
                      ) : (
                        <button className="text-zinc-300 hover:text-zinc-500">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination currentPage={page} totalPages={3} onPageChange={setPage} className="py-6 border-t border-zinc-100" />
          </div>
        </div>

        {/* 우: 이의 신청 내역 (5/12) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900">이의 신청 내역</h2>
            {myAppeals.filter((r) => r.status === "대기").length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {myAppeals.filter((r) => r.status === "대기").length}건 대기
              </span>
            )}
          </div>

          {myAppeals.length > 0 ? (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {myAppeals.map((appeal) => (
                <div
                  key={appeal.id}
                  className="bg-zinc-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-zinc-600 border border-zinc-200">
                          {appeal.course}
                        </span>
                        <span className="text-xs text-zinc-400">{appeal.date}</span>
                      </div>
                      <p className="text-sm text-zinc-700 line-clamp-2">{appeal.reason}</p>
                      <p className="text-xs text-zinc-400 mt-1.5">신청일: {appeal.requestDate}</p>
                    </div>
                    <div className="shrink-0">
                      <div className="flex flex-col items-end gap-1.5">
                        {appeal.status === "승인" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                            <CheckCircle className="w-3 h-3" /> 승인
                          </span>
                        ) : appeal.status === "거절" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
                            <XCircle className="w-3 h-3" /> 반려
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                            <Clock className="w-3 h-3" /> 대기
                          </span>
                        )}
                        {appeal.status === "대기" && (
                          <button
                            onClick={() => {
                              if (window.confirm("정말 취소하시겠습니까?")) {
                                deleteAppeal(appeal.id);
                                toast.success("이의 신청이 취소되었습니다.");
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> 취소
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {appeal.status === "거절" && appeal.rejectReason && (
                    <div className="mt-3 bg-rose-50 border border-rose-100 rounded-lg p-3">
                      <p className="text-xs text-rose-600 font-medium">반려 사유</p>
                      <p className="text-sm text-rose-700 mt-0.5">{appeal.rejectReason}</p>
                    </div>
                  )}
                  {appeal.status === "승인" && (
                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-primary-dark font-medium">승인 완료 — 출결이 출석으로 변경되었습니다.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">이의 신청 내역이 없습니다</p>
              <p className="text-xs text-zinc-400 mt-1">결석 항목에서 이의 신청할 수 있습니다.</p>
            </div>
          )}
        </div>

      </section>

      {/* 이의 신청 모달 */}
      <FormModal
        open={showAppealModal}
        onClose={() => { setShowAppealModal(false); setAppealReason(""); }}
        title="출결 이의 신청"
        titleIcon={<AlertCircle className="w-5 h-5 text-amber-500" />}
        footer={<>
          <button onClick={() => { setShowAppealModal(false); setAppealReason(""); }} className="text-sm text-zinc-500 px-4 py-2 hover:text-zinc-700">취소</button>
          <button
            onClick={() => {
              if (!appealReason.trim()) {
                toast.error("이의 신청 사유를 입력해주세요");
                return;
              }
              addAppeal({
                studentId: "20240201",
                studentName: "강신우",
                course: appealRecord?.course || "",
                date: appealRecord?.date || "",
                reason: appealReason,
              });
              toast.success("이의 신청이 접수되었습니다. 교수님 검토 후 처리됩니다.");
              setShowAppealModal(false);
              setAppealReason("");
            }}
            className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-800"
          >
            신청하기
          </button>
        </>}
      >
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800 font-medium">수업에 참석했으나 출석이 인식되지 않았나요?</p>
          <p className="text-xs text-amber-600 mt-1">이의 신청 사유를 구체적으로 작성해 주세요. 교수님이 검토 후 출결 상태를 변경합니다.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">강의명</label>
            <input value={appealRecord?.course || ""} disabled className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 수업 날짜
            </label>
            <input value={appealRecord?.date || ""} disabled className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-500" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">이의 신청 사유</label>
          <textarea
            value={appealReason}
            onChange={(e) => setAppealReason(e.target.value)}
            placeholder="예: 수업에 참석했으나 얼굴 인식 단말기가 정상적으로 인식하지 못했습니다."
            className="w-full rounded-lg border border-zinc-200 p-3 text-sm resize-none h-28 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </FormModal>
    </div>
  );
}
