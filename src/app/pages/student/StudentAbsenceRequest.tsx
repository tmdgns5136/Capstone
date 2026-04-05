import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Upload, Clock, CheckCircle, XCircle, BookOpen, AlertTriangle, ArrowRight, X, Trash2, Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getMyLectures,
  getOfficialRequests,
  getOfficialRequestDetail,
  applyOfficialAbsence,
  deleteOfficialRequest,
  MyLectureData,
  AbsenceRequestData,
  AbsenceDetailData,
} from "../../api/studentLecture";

const spring = { type: "spring", stiffness: 100, damping: 20 };

// 백엔드 status 코드를 한글로 변환
function statusLabel(status: string) {
  switch (status) {
    case "APPROVED": return "승인";
    case "REJECTED": return "거절";
    default: return "대기";
  }
}

export default function StudentAbsenceRequest() {
  // 강의 목록
  const [courses, setCourses] = useState<MyLectureData[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState("");

  // 신청 폼
  const [title, setTitle] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 신청 내역
  const [requests, setRequests] = useState<AbsenceRequestData[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // 상세 보기
  const [detailData, setDetailData] = useState<AbsenceDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 강의 목록 로드
  useEffect(() => {
    getMyLectures(2026, "1")
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  // 강의 선택 시 신청 내역 로드
  useEffect(() => {
    if (!selectedLectureId) {
      setRequests([]);
      return;
    }
    setLoadingRequests(true);
    getOfficialRequests(selectedLectureId)
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoadingRequests(false));
  }, [selectedLectureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLectureId || !title || !reason || !absenceDate) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!file) {
      toast.error("증빙 서류를 첨부해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: 세션 목록 조회 API가 추가되면 absenceDate → sessionId 매핑 필요
      await applyOfficialAbsence(
        selectedLectureId,
        { sessionId: 0, title, reason },
        file,
      );
      toast.success("공결 신청이 완료되었습니다. 검토 후 처리됩니다.");

      // 폼 초기화
      setTitle("");
      setAbsenceDate("");
      setReason("");
      setFile(null);

      // 목록 새로고침
      const res = await getOfficialRequests(selectedLectureId);
      setRequests(res.data);
    } catch (err: any) {
      toast.error(err.message || "공결 신청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, requestId: number) => {
    e.stopPropagation();
    if (!window.confirm("공결 신청을 삭제하시겠습니까?")) return;

    try {
      await deleteOfficialRequest(selectedLectureId, requestId);
      toast.success("공결 신청이 삭제되었습니다.");
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  const handleShowDetail = async (requestId: number) => {
    setLoadingDetail(true);
    try {
      const res = await getOfficialRequestDetail(selectedLectureId, requestId);
      setDetailData(res.data);
    } catch {
      toast.error("상세 정보를 불러올 수 없습니다.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const label = statusLabel(status);
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
            <CheckCircle strokeWidth={1.5} className="w-3 h-3" /> {label}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
            <XCircle strokeWidth={1.5} className="w-3 h-3" /> {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
            <Clock strokeWidth={1.5} className="w-3 h-3" /> {label}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <FileText strokeWidth={1.5} className="w-6 h-6 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">공결 신청서</h1>
            <p className="text-sm text-zinc-400 mt-0.5">공결 사유를 작성하고 증빙 서류를 제출하세요</p>
          </div>
        </div>
      </div>

      {/* Main grid: 5:3 asymmetric */}
      <div className="grid lg:grid-cols-8 gap-6">
        {/* REQUEST FORM */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 "
        >
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">새 공결 신청</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                강의 선택 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                  className="w-full appearance-none cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                >
                  <option value="" disabled>강의를 선택하세요</option>
                  {courses.map((course) => (
                    <option key={course.lectureId} value={course.lectureId}>
                      {course.lectureName} ({course.professorName})
                    </option>
                  ))}
                </select>
                <BookOpen strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공결 신청 제목을 입력하세요"
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-zinc-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                결석 날짜 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-zinc-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                사유 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="결석 사유를 상세히 입력하세요..."
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none placeholder:text-zinc-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                증빙 서류 <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary bg-primary/10 p-3 text-sm">
                    <span className="truncate flex-1 text-primary-dark font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1 rounded-lg hover:bg-primary/20 text-primary-dark transition-colors ml-2"
                    >
                      <X strokeWidth={1.5} className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 p-6 text-sm text-zinc-400 hover:border-primary hover:text-primary-dark hover:bg-primary/10/50 transition-all"
                  >
                    <Upload strokeWidth={1.5} className="w-5 h-5" />
                    파일 첨부하기
                  </button>
                )}

                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                  <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5" /> PDF, JPG, PNG 업로드 가능 (최대 5MB)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 제출 중...</>
              ) : (
                <>제출하기 <ArrowRight strokeWidth={1.5} className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-6">
          {/* GUIDELINES */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.06 }}
            className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5"
          >
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight mb-3 flex items-center gap-2">
              <AlertTriangle strokeWidth={1.5} className="w-4 h-4 text-amber-500" />
              공결 신청 가이드
            </h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                결석일로부터 <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">7일 이내</span>에 신청 필수
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                증빙 서류 제출 시 승인 확률 상승
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                거절 시 사유 확인 후 재신청 가능
              </li>
            </ul>
          </motion.div>

          {/* REQUEST HISTORY LIST */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.12 }}
            className="bg-white rounded-xl border border-zinc-200 "
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">나의 신청 내역</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-500">
                {requests.length}건
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {!selectedLectureId ? (
                <div className="text-center py-10 text-sm text-zinc-400">
                  강의를 선택하면 신청 내역을 확인할 수 있습니다
                </div>
              ) : loadingRequests ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-10 text-sm text-zinc-400">
                  신청 내역이 없습니다
                </div>
              ) : (
                requests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: index * 0.06 }}
                    onClick={() => handleShowDetail(request.requestId)}
                    className="rounded-xl border border-zinc-100 p-4 hover:border-zinc-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">{request.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{request.requestDate}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                      <span className="text-xs text-zinc-400">
                        신청일: {request.requestDate}
                      </span>
                      <div className="flex items-center gap-2">
                        {request.status === "PENDING" && (
                          <button
                            onClick={(e) => handleDelete(e, request.requestId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> 삭제
                          </button>
                        )}
                        <span className="text-xs text-primary font-medium">상세보기 &rarr;</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {(detailData || loadingDetail) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={spring}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              {loadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : detailData && (
                <>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 공결 신청 상세
                    </h3>
                    <button
                      onClick={() => setDetailData(null)}
                      className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* 상태 & 기본 정보 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-zinc-900">{detailData.title}</h4>
                        <p className="text-sm text-zinc-400 mt-0.5">
                          신청일: {detailData.requestData}
                          {detailData.sessionId && ` · 세션 #${detailData.sessionId}`}
                        </p>
                      </div>
                      {getStatusBadge(detailData.status)}
                    </div>

                    {/* 사유 */}
                    <div className="bg-zinc-50 rounded-xl p-4">
                      <p className="text-xs text-zinc-400 mb-1.5 font-medium">신청 사유</p>
                      <p className="text-sm text-zinc-800 whitespace-pre-wrap">{detailData.reason}</p>
                    </div>

                    {/* 증빙 서류 */}
                    <div>
                      <p className="text-xs text-zinc-400 mb-2 font-medium">증빙 서류</p>
                      {detailData.evidenceFileUrl ? (
                        <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                          <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4 text-sky-600" strokeWidth={1.5} />
                          </div>
                          <a
                            href={detailData.evidenceFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-sky-800 flex-1 truncate hover:underline"
                          >
                            증빙서류 보기
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <AlertTriangle className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          <span className="text-sm text-zinc-500">첨부된 서류가 없습니다</span>
                        </div>
                      )}
                    </div>

                    {/* 상태별 안내 */}
                    {detailData.status === "APPROVED" && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-primary-dark" strokeWidth={1.5} />
                          <span className="text-xs font-semibold text-primary-dark">교수님 승인</span>
                        </div>
                        <p className="text-sm text-primary-dark">공결 처리가 승인되었습니다. 해당 수업의 출결이 공결로 변경됩니다.</p>
                      </div>
                    )}

                    {detailData.status === "REJECTED" && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" strokeWidth={1.5} />
                          <span className="text-xs font-semibold text-rose-700">교수님 반려</span>
                        </div>
                        <p className="text-sm text-rose-700">반려되었습니다. 사유를 확인 후 재신청해 주세요.</p>
                      </div>
                    )}

                    {detailData.status === "PENDING" && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.5} />
                          <span className="text-xs font-semibold text-amber-700">검토 대기 중</span>
                        </div>
                        <p className="text-sm text-amber-700">교수님이 아직 검토하지 않았습니다. 처리가 완료되면 결과를 확인할 수 있습니다.</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
                    {detailData.status === "PENDING" && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("공결 신청을 삭제하시겠습니까?")) return;
                          try {
                            await deleteOfficialRequest(selectedLectureId, detailData.requestId);
                            toast.success("공결 신청이 삭제되었습니다.");
                            setRequests((prev) => prev.filter((r) => r.requestId !== detailData.requestId));
                            setDetailData(null);
                          } catch (err: any) {
                            toast.error(err.message || "삭제에 실패했습니다.");
                          }
                        }}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 px-4 py-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> 신청 삭제
                      </button>
                    )}
                    <button
                      onClick={() => setDetailData(null)}
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
    </div>
  );
}
