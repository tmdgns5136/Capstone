import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileCheck, CheckCircle, XCircle, Clock, FileText, X, AlertTriangle, User, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppealRequests } from "../../hooks/useAppealRequests";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export default function ProfessorAppealManagement() {
  const { requests, loading, updateStatus } = useAppealRequests();
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. 필터링 로직 수정
  const filteredRequests = requests.filter(r =>
    r.studentName.includes(searchQuery) ||
    r.course.includes(searchQuery) ||
    r.studentId.includes(searchQuery)
  );

  const pendingRequests = filteredRequests.filter(r => r.status === "PENDING");
  const processedRequests = filteredRequests.filter(r => r.status !== "PENDING");

  // 2. 처리 함수 수정 
  const handleApprove = async (id: string) => { 
    const success = await updateStatus(id, "APPROVED");
    if (success) {
      toast.success("이의 신청이 승인되었습니다. 출결 상태가 출석으로 변경됩니다.");
      setSelectedRequest(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("거절 사유를 입력해주세요");
      return;
    }
    const success = await updateStatus(id, "REJECTED", rejectReason);
    if (success) {
      toast.success("이의 신청이 반려되었습니다.");
      setSelectedRequest(null);
      setRejectReason("");
    }
  };

  // 3. 뱃지 로직 수정 (영문 대응)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
            <CheckCircle className="w-3 h-3" strokeWidth={1.5} /> 승인
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
            <XCircle className="w-3 h-3" strokeWidth={1.5} /> 반려
          </span>
        );
      default: // WAIT
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" strokeWidth={1.5} /> 대기
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">이의 신청 관리</h1>
        <p className="text-sm text-zinc-400 mt-1">학생들의 출결 이의 신청을 검토하고 승인 또는 반려하세요</p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-medium text-amber-800">이의 신청은 공결 신청과 다릅니다</p>
          <p className="text-xs text-amber-600 mt-0.5">학생이 수업에 참석했으나 얼굴 인식이 정상적으로 되지 않은 경우 제출하는 신청입니다. 승인 시 해당 수업의 출결 상태가 출석으로 변경됩니다.</p>
        </div>
      </div>

      {/* Stats Overview - 영문 상태값으로 카운트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 font-medium">대기 중인 이의</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{requests.filter(r => r.status === "PENDING").length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 font-medium">승인됨</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{requests.filter(r => r.status === "APPROVED").length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary-dark" strokeWidth={1.5} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 font-medium">반려됨</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{requests.filter(r => r.status === "REJECTED").length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-600" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {/* Tabs & Search */}
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "pending" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              대기 중 ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "processed" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              처리 완료 ({processedRequests.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="학생명, 학번, 과목명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "pending" ? (
            pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.objectionId} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 mb-2">
                          {request.course}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          {request.studentName}
                          <span className="text-xs text-zinc-400 font-normal">({request.studentId})</span>
                        </h3>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="bg-zinc-50 rounded-xl p-3 flex-1 mb-4">
                      <div className="text-xs text-zinc-400 mb-1">결석 처리일: {request.date}</div>
                      <p className="text-sm text-zinc-700 line-clamp-2">{request.reason}</p>
                    </div>

                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" strokeWidth={1.5} /> 상세 검토하기
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-zinc-500">대기 중인 이의 신청이 없습니다</p>
                <p className="text-xs text-zinc-400 mt-1">모든 이의 신청을 처리했습니다.</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {processedRequests.length > 0 ? (
                processedRequests.map((request, index) => (
                  <motion.div
                    key={request.objectionId} // id -> objectionId 수정
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: index * 0.05 }}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-50 rounded-xl items-center hover:bg-zinc-100 transition-colors"
                  >
                    <div className="flex-1 grid md:grid-cols-4 gap-3 w-full items-center">
                      <div className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                         <div className="w-7 h-7 bg-zinc-200 text-zinc-500 flex items-center justify-center rounded-full">
                           <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                         </div>
                        {request.studentName} <span className="text-zinc-400 text-xs font-normal">({request.studentId})</span>
                      </div>
                      <div className="text-sm text-zinc-600">{request.course}</div>
                      <div className="text-sm text-zinc-500">{request.date}</div>
                      <div className="flex justify-end">{getStatusBadge(request.status)}</div>
                    </div>

                    {request.rejectReason && (
                      <div className="w-full md:w-auto bg-rose-50 text-rose-700 rounded-lg p-2 text-xs font-medium">
                        <span className="text-rose-500">반려 사유:</span> {request.rejectReason}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                    <FileCheck className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">처리된 이의 신청이 없습니다</p>
                  <p className="text-xs text-zinc-400 mt-1">처리된 이의 신청 내역이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={spring}
              className="bg-white rounded-xl shadow-xl max-w-xl w-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" strokeWidth={1.5} /> 이의 신청 검토
                </h3>
                <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-sm text-amber-800 font-medium">출결 이의 신청</p>
                  <p className="text-xs text-amber-600 mt-0.5">학생이 수업에 참석했으나 인식되지 않았다고 주장합니다. 승인 시 출석으로 변경됩니다.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">학생 정보</div>
                    <div className="font-semibold text-zinc-900 text-lg">{selectedRequest.studentName}</div>
                    <div className="text-sm text-zinc-500 mt-0.5">{selectedRequest.studentId}</div>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">강의 정보</div>
                    <div className="font-semibold text-zinc-900">{selectedRequest.course}</div>
                    <div className="text-sm text-zinc-500 mt-0.5">{selectedRequest.date}</div>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-xl p-4">
                  <div className="text-xs text-zinc-400 mb-2">이의 신청 사유</div>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap">{selectedRequest.reason}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-medium text-zinc-700">반려 사유 (반려 시 필수 입력)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none placeholder:text-zinc-400"
                    placeholder="반려 사유를 구체적으로 입력하세요..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleReject(selectedRequest.appealId)} // .id -> .appealId 수정
                    className="flex-1 py-2.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1.5} /> 반려하기
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.appealId)} // .id -> .appealId 수정
                    className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> 승인 (출석 변경)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}