import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Calendar, MoreHorizontal, ArrowRight, AlertCircle, CheckCircle, XCircle, Clock, Trash2, Upload, Loader2, FileText, X, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { ScrollableCardList } from "../../components/ScrollableCardList";
import { ATTENDANCE_STATUS_COLORS } from "../../constants/attendance";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { FilterTabs } from "../../components/FilterTabs";
import { FormModal } from "../../components/FormModal";
import { PageHeader } from "../../components/PageHeader";
import { AnimatePresence, motion } from "motion/react";
import {
  getMyLectures,
  getLectureSessions,
  getObjectionRequests,
  getObjectionRequestDetail,
  applyObjectionAbsence,
  deleteObjectionRequest,
  MyLectureData,
  SessionData,
  AbsenceRequestData,
  AbsenceDetailData,
} from "../../api/studentLecture";

// 백엔드 status 코드를 한글로 변환
function statusLabel(status: string) {
  switch (status) {
    case "APPROVED": return "승인";
    case "REJECTED": return "거절";
    default: return "대기";
  }
}

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

  // 이의 신청 모달
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealRecord, setAppealRecord] = useState<{ course: string; date: string } | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [appealTitle, setAppealTitle] = useState("");
  const [appealFile, setAppealFile] = useState<File | null>(null);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  // 강의 목록 (이의 신청에 사용할 lectureId 매핑)
  const [lectures, setLectures] = useState<MyLectureData[]>([]);
  const [selectedAppealLectureId, setSelectedAppealLectureId] = useState("");

  // 세션 목록 (이의 신청 시 날짜 → sessionId 매핑)
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedAppealSessionId, setSelectedAppealSessionId] = useState("");

  // 이의 신청 내역 (API)
  const [appealRequests, setAppealRequests] = useState<AbsenceRequestData[]>([]);
  const [loadingAppeals, setLoadingAppeals] = useState(false);

  // 이의 신청 상세 보기
  const [appealDetailData, setAppealDetailData] = useState<AbsenceDetailData | null>(null);
  const [appealDetailSessionDate, setAppealDetailSessionDate] = useState("");
  const [loadingAppealDetail, setLoadingAppealDetail] = useState(false);

  const [page, setPage] = useState(1);
  const [scrollPage] = useState(() => {
    const saved = sessionStorage.getItem("statsScrollPage");
    return saved ? parseInt(saved, 10) : 0;
  });
  const handleScrollPageChange = useCallback((p: number) => {
    sessionStorage.setItem("statsScrollPage", String(p));
  }, []);

  // 강의 목록 로드
  useEffect(() => {
    getMyLectures(2026, "1")
      .then((res) => setLectures(res.data))
      .catch(() => setLectures([]));
  }, []);

  // 선택한 강의의 이의 신청 내역 로드
  const loadAppeals = useCallback(async (lectureId: string) => {
    if (!lectureId) {
      setAppealRequests([]);
      return;
    }
    setLoadingAppeals(true);
    try {
      const res = await getObjectionRequests(lectureId);
      setAppealRequests(res.data);
    } catch {
      setAppealRequests([]);
    } finally {
      setLoadingAppeals(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAppealLectureId) {
      loadAppeals(selectedAppealLectureId);
      getLectureSessions(selectedAppealLectureId)
        .then((res) => setSessions(res.data))
        .catch(() => setSessions([]));
    } else {
      setSessions([]);
    }
  }, [selectedAppealLectureId, loadAppeals]);

  // 첫 번째 강의를 기본 선택
  useEffect(() => {
    if (lectures.length > 0 && !selectedAppealLectureId) {
      setSelectedAppealLectureId(lectures[0].lectureId);
    }
  }, [lectures, selectedAppealLectureId]);

  const handleSubmitAppeal = async () => {
    if (!appealTitle.trim() || !appealReason.trim() || !selectedAppealLectureId || !selectedAppealSessionId) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!appealFile) {
      toast.error("증빙 서류를 첨부해주세요.");
      return;
    }

    setSubmittingAppeal(true);
    try {
      await applyObjectionAbsence(
        selectedAppealLectureId,
        { sessionId: Number(selectedAppealSessionId), title: appealTitle, reason: appealReason },
        appealFile,
      );
      toast.success("이의 신청이 접수되었습니다. 교수님 검토 후 처리됩니다.");
      setShowAppealModal(false);
      setAppealTitle("");
      setAppealReason("");
      setSelectedAppealSessionId("");
      setAppealFile(null);

      // 목록 새로고침
      await loadAppeals(selectedAppealLectureId);
    } catch (err: any) {
      toast.error(err.message || "이의 신청에 실패했습니다.");
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const getCourseName = (lectureId: string) =>
    lectures.find((c) => String(c.lectureId) === String(lectureId))?.lectureName || "";
  const getProfessorName = (lectureId: string) =>
    lectures.find((c) => String(c.lectureId) === String(lectureId))?.professorName || "";

  const handleShowAppealDetail = async (requestId: number) => {
    setLoadingAppealDetail(true);
    setAppealDetailSessionDate("");
    try {
      const [detailRes, sessionsRes] = await Promise.all([
        getObjectionRequestDetail(selectedAppealLectureId, requestId),
        getLectureSessions(selectedAppealLectureId),
      ]);
      setAppealDetailData(detailRes.data);
      const session = sessionsRes.data.find((s) => s.sessionId === detailRes.data.sessionId);
      if (session) {
        setAppealDetailSessionDate(`${session.sessionDate} (${session.startTime} ~ ${session.endTime})`);
      }
    } catch {
      toast.error("상세 정보를 불러올 수 없습니다.");
    } finally {
      setLoadingAppealDetail(false);
    }
  };

  const handleDeleteAppeal = async (requestId: number) => {
    if (!window.confirm("이의 신청을 삭제하시겠습니까?")) return;
    try {
      await deleteObjectionRequest(selectedAppealLectureId, requestId);
      toast.success("이의 신청이 삭제되었습니다.");
      setAppealRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

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
          <div className="px-5 py-4 border-b border-zinc-100 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900">이의 신청 내역</h2>
              {appealRequests.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {appealRequests.filter((r) => r.status === "PENDING").length}건 대기
                </span>
              )}
            </div>
            {/* 강의 선택 */}
            <select
              value={selectedAppealLectureId}
              onChange={(e) => setSelectedAppealLectureId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" disabled>강의를 선택하세요</option>
              {lectures.map((l) => (
                <option key={l.lectureId} value={l.lectureId}>
                  {l.lectureName}
                </option>
              ))}
            </select>
          </div>

          {loadingAppeals ? (
            <div className="flex items-center justify-center py-12 flex-1">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : appealRequests.length > 0 ? (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {appealRequests.map((appeal) => (
                <div
                  key={appeal.requestId}
                  onClick={() => handleShowAppealDetail(appeal.requestId)}
                  className="bg-zinc-50 rounded-lg p-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-zinc-900">{appeal.title}</span>
                      <p className="text-xs text-zinc-400 mt-1.5">신청일: {appeal.requestDate}</p>
                    </div>
                    <div className="shrink-0">
                      <div className="flex flex-col items-end gap-1.5">
                        {appeal.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                            <CheckCircle className="w-3 h-3" /> 승인
                          </span>
                        ) : appeal.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
                            <XCircle className="w-3 h-3" /> 반려
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                            <Clock className="w-3 h-3" /> 대기
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-200">
                    {appeal.status === "PENDING" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteAppeal(appeal.requestId); }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> 삭제
                      </button>
                    )}
                    <span className="text-xs text-primary font-medium ml-auto">상세보기 &rarr;</span>
                  </div>
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

      {/* 이의 신청 상세 모달 */}
      <AnimatePresence>
        {(appealDetailData || loadingAppealDetail) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              {loadingAppealDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : appealDetailData && (
                <>
                  <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 이의 신청 상세
                    </h3>
                    <button
                      onClick={() => setAppealDetailData(null)}
                      className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-zinc-900">{appealDetailData.title}</h4>
                      {appealDetailData.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                          <CheckCircle className="w-3 h-3" /> 승인
                        </span>
                      ) : appealDetailData.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
                          <XCircle className="w-3 h-3" /> 반려
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" /> 대기
                        </span>
                      )}
                    </div>

                    <div className="bg-zinc-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">강의명</p>
                        <p className="text-sm text-zinc-800 mt-0.5">{getCourseName(selectedAppealLectureId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">교수명</p>
                        <p className="text-sm text-zinc-800 mt-0.5">{getProfessorName(selectedAppealLectureId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">수업 날짜</p>
                        <p className="text-sm text-zinc-800 mt-0.5">{appealDetailSessionDate || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">신청일</p>
                        <p className="text-sm text-zinc-800 mt-0.5">{appealDetailData.requestData}</p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 rounded-xl p-4">
                      <p className="text-xs text-zinc-400 mb-1.5 font-medium">신청 사유</p>
                      <p className="text-sm text-zinc-800 whitespace-pre-wrap">{appealDetailData.reason}</p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400 mb-2 font-medium">증빙 서류</p>
                      {appealDetailData.evidenceFileUrl ? (
                        <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                          <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4 text-sky-600" strokeWidth={1.5} />
                          </div>
                          <a href={appealDetailData.evidenceFileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-800 flex-1 truncate hover:underline">
                            증빙서류 보기
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <AlertCircle className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          <span className="text-sm text-zinc-500">첨부된 서류가 없습니다</span>
                        </div>
                      )}
                    </div>

                    {appealDetailData.status === "APPROVED" && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <p className="text-sm text-primary-dark">이의 신청이 승인되어 출결이 출석으로 변경되었습니다.</p>
                      </div>
                    )}
                    {appealDetailData.status === "REJECTED" && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                        <p className="text-sm text-rose-700">반려되었습니다. 사유를 확인 후 재신청해 주세요.</p>
                      </div>
                    )}
                    {appealDetailData.status === "PENDING" && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-sm text-amber-700">교수님이 아직 검토하지 않았습니다.</p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
                    {appealDetailData.status === "PENDING" && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("이의 신청을 삭제하시겠습니까?")) return;
                          try {
                            await deleteObjectionRequest(selectedAppealLectureId, appealDetailData.requestId);
                            toast.success("이의 신청이 삭제되었습니다.");
                            setAppealRequests((prev) => prev.filter((r) => r.requestId !== appealDetailData.requestId));
                            setAppealDetailData(null);
                          } catch (err: any) {
                            toast.error(err.message || "취소에 실패했습니다.");
                          }
                        }}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 px-4 py-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> 신청 삭제
                      </button>
                    )}
                    <button
                      onClick={() => setAppealDetailData(null)}
                      className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 이의 신청 모달 */}
      <FormModal
        open={showAppealModal}
        onClose={() => { setShowAppealModal(false); setAppealTitle(""); setAppealReason(""); setAppealFile(null); }}
        title="출결 이의 신청"
        titleIcon={<AlertCircle className="w-5 h-5 text-amber-500" />}
        footer={<>
          <button onClick={() => { setShowAppealModal(false); setAppealTitle(""); setAppealReason(""); setSelectedAppealSessionId(""); setAppealFile(null); }} className="text-sm text-zinc-500 px-4 py-2 hover:text-zinc-700">취소</button>
          <button
            onClick={handleSubmitAppeal}
            disabled={submittingAppeal}
            className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
          >
            {submittingAppeal ? <><Loader2 className="w-4 h-4 animate-spin" /> 제출 중...</> : "신청하기"}
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
              <Calendar className="w-3.5 h-3.5" /> 수업 날짜 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAppealSessionId}
              onChange={(e) => setSelectedAppealSessionId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="" disabled>날짜 선택</option>
              {sessions.map((s) => (
                <option key={s.sessionId} value={s.sessionId}>
                  {s.sessionDate} ({s.startTime}~{s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">제목 <span className="text-red-500">*</span></label>
          <input
            value={appealTitle}
            onChange={(e) => setAppealTitle(e.target.value)}
            placeholder="이의 신청 제목"
            className="w-full rounded-lg border border-zinc-200 p-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">이의 신청 사유 <span className="text-red-500">*</span></label>
          <textarea
            value={appealReason}
            onChange={(e) => setAppealReason(e.target.value)}
            placeholder="예: 수업에 참석했으나 얼굴 인식 단말기가 정상적으로 인식하지 못했습니다."
            className="w-full rounded-lg border border-zinc-200 p-3 text-sm resize-none h-28 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">증빙 서류 <span className="text-red-500">*</span></label>
          <input
            id="appeal-file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setAppealFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          {appealFile ? (
            <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/10 p-3 text-sm">
              <span className="truncate flex-1 text-primary-dark font-medium">{appealFile.name}</span>
              <button
                type="button"
                onClick={() => setAppealFile(null)}
                className="p-1 rounded hover:bg-primary/20 text-primary-dark transition-colors ml-2"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById("appeal-file-upload")?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 p-4 text-sm text-zinc-400 hover:border-primary hover:text-primary-dark transition-all"
            >
              <Upload className="w-4 h-4" /> 파일 첨부하기
            </button>
          )}
        </div>
      </FormModal>
    </div>
  );
}
