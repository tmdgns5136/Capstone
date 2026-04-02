import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Upload, Clock, CheckCircle, XCircle, BookOpen, AlertTriangle, ArrowRight, X, Trash2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useAbsenceRequests, AbsenceRequest } from "../../hooks/useAbsenceRequests";

const COURSES = [
  { id: 1, name: "데이터베이스" },
  { id: 2, name: "알고리즘" },
  { id: 3, name: "웹프로그래밍" },
  { id: 4, name: "운영체제" },
  { id: 5, name: "네트워크" },
];

const spring = { type: "spring", stiffness: 100, damping: 20 };

export default function StudentAbsenceRequest() {
  const { requests, addRequest, deleteRequest } = useAbsenceRequests();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [detailRequest, setDetailRequest] = useState<AbsenceRequest | null>(null);

  // 현재 로그인한 사용자 정보 상태
  const [currentUser, setCurrentUser] = useState({
    name: "김철수",
    studentId: "20240101"
  });

  useEffect(() => {
    // Always use demo user
    setCurrentUser({
      name: "김철수 (데모)",
      studentId: "20240101"
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !absenceDate || !reason) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    addRequest({
      studentId: currentUser.studentId,
      studentName: currentUser.name,
      course: selectedCourse,
      date: absenceDate,
      reason,
      hasDocument: !!file,
      fileName: file?.name,
    });

    toast.success("공결 신청이 완료되었습니다. 검토 후 처리됩니다.");

    // Reset form
    setSelectedCourse("");
    setAbsenceDate("");
    setReason("");
    setFile(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("공결 신청을 삭제하시겠습니까?")) return;
    deleteRequest(id);
    toast.success("공결 신청이 삭제되었습니다.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "승인":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
            <CheckCircle strokeWidth={1.5} className="w-3 h-3" /> 승인
          </span>
        );
      case "거절":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
            <XCircle strokeWidth={1.5} className="w-3 h-3" /> 거절
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
            <Clock strokeWidth={1.5} className="w-3 h-3" /> 대기
          </span>
        );
    }
  };

  const myRequests = requests.filter(req => req.studentId === currentUser.studentId);

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
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full appearance-none cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                >
                  <option value="" disabled>강의를 선택하세요</option>
                  {COURSES.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <BookOpen strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
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
                증빙 서류 (선택)
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
              className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 mt-2"
            >
              제출하기 <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
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
                {myRequests.length}건
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {myRequests.length === 0 ? (
                <div className="text-center py-10 text-sm text-zinc-400">
                  신청 내역이 없습니다
                </div>
              ) : (
                myRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: index * 0.06 }}
                    onClick={() => setDetailRequest(request)}
                    className="rounded-xl border border-zinc-100 p-4 hover:border-zinc-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">{request.course}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{request.date}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <p className="text-sm text-zinc-600 line-clamp-1 mb-2">{request.reason}</p>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                      <span className="text-xs text-zinc-400">
                        신청일: {request.requestDate}
                      </span>
                      <div className="flex items-center gap-2">
                        {request.hasDocument && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-700">
                            <Paperclip className="w-3 h-3" /> 서류
                          </span>
                        )}
                        {request.status !== "대기" && (
                          <span className="text-xs text-primary font-medium">상세보기 &rarr;</span>
                        )}
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
        {detailRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={spring}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 공결 신청 상세
                </h3>
                <button
                  onClick={() => setDetailRequest(null)}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* 상태 & 기본 정보 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-zinc-900">{detailRequest.course}</h4>
                    <p className="text-sm text-zinc-400 mt-0.5">결석일: {detailRequest.date} · 신청일: {detailRequest.requestDate}</p>
                  </div>
                  {getStatusBadge(detailRequest.status)}
                </div>

                {/* 사유 */}
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-xs text-zinc-400 mb-1.5 font-medium">신청 사유</p>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap">{detailRequest.reason}</p>
                </div>

                {/* 증빙 서류 */}
                <div>
                  <p className="text-xs text-zinc-400 mb-2 font-medium">증빙 서류</p>
                  {detailRequest.hasDocument ? (
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4 text-sky-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-sky-800 flex-1 truncate">
                        {detailRequest.fileName || "증빙서류_첨부됨.pdf"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <AlertTriangle className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      <span className="text-sm text-zinc-500">첨부된 서류가 없습니다</span>
                    </div>
                  )}
                </div>

                {/* 교수님 답변 (승인/거절 시) */}
                {detailRequest.status === "승인" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary-dark" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-primary-dark">교수님 승인</span>
                    </div>
                    <p className="text-sm text-primary-dark">공결 처리가 승인되었습니다. 해당 수업의 출결이 공결로 변경됩니다.</p>
                  </div>
                )}

                {detailRequest.status === "거절" && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-rose-700">교수님 반려</span>
                    </div>
                    <p className="text-sm text-rose-700">{detailRequest.rejectReason || "반려 사유가 기재되지 않았습니다."}</p>
                  </div>
                )}

                {detailRequest.status === "대기" && (
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
                {detailRequest.status === "대기" && (
                  <button
                    onClick={() => {
                      if (!window.confirm("공결 신청을 삭제하시겠습니까?")) return;
                      deleteRequest(detailRequest.id);
                      toast.success("공결 신청이 삭제되었습니다.");
                      setDetailRequest(null);
                    }}
                    className="text-sm font-medium text-rose-600 hover:text-rose-700 px-4 py-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> 신청 삭제
                  </button>
                )}
                <button
                  onClick={() => setDetailRequest(null)}
                  className="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
