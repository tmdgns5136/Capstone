import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, CheckCircle, XCircle, Clock, X, User, Search, AlertCircle, Image } from "lucide-react";
import { toast } from "sonner";
import { usePhotoRequests, PhotoDetailData } from "../../hooks/usePhotoRequests";

const spring = { type: "spring", stiffness: 100, damping: 20 };

const BASE_IMAGE_URL = "/api/admin/image/";

function getPhotoUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const fileName = url.split("/").pop();
  return `${BASE_IMAGE_URL}${fileName}`;
}

function PhotoThumbnail({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-300">
        <Image className="w-6 h-6" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function AdminPhotoRequestManagement() {
  const {
    pendingRequests,
    completedRequests,
    loading,
    pendingTotal,
    completedTotal,
    fetchPending,
    fetchCompleted,
    fetchDetail,
    approve,
  } = usePhotoRequests();

  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending");
  const [selectedDetail, setSelectedDetail] = useState<PhotoDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPending = pendingRequests.filter(r =>
    r.studentName.includes(searchQuery) ||
    r.studentNum.includes(searchQuery)
  );

  const filteredCompleted = completedRequests.filter(r =>
    r.studentName.includes(searchQuery) ||
    r.studentNum.includes(searchQuery)
  );

  const handleViewDetail = async (requestId: string) => {
    setDetailLoading(true);
    const detail = await fetchDetail(requestId);
    if (detail) {
      setSelectedDetail(detail);
    } else {
      toast.error("상세 정보를 불러올 수 없습니다.");
    }
    setDetailLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedDetail) return;
    try {
      await approve(selectedDetail.requestId, "APPROVED");
      toast.success("사진 변경 요청이 승인되었습니다.");
      setSelectedDetail(null);
      fetchPending();
      fetchCompleted();
    } catch (e: any) {
      toast.error(e.message || "승인 처리에 실패했습니다.");
    }
  };

  const handleReject = async () => {
    if (!selectedDetail) return;
    if (!rejectReason.trim()) {
      toast.error("거절 사유를 입력해주세요");
      return;
    }
    try {
      await approve(selectedDetail.requestId, "REJECTED", rejectReason);
      toast.success("사진 변경 요청이 거절되었습니다.");
      setSelectedDetail(null);
      setRejectReason("");
      fetchPending();
      fetchCompleted();
    } catch (e: any) {
      toast.error(e.message || "거절 처리에 실패했습니다.");
    }
  };

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
            <XCircle className="w-3 h-3" strokeWidth={1.5} /> 거절
          </span>
        );
      default:
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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">사진 변경 요청 관리</h1>
        <p className="text-sm text-zinc-400 mt-1">학생들의 얼굴 인식 사진 변경 요청을 검토하고 승인 또는 거절하세요</p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-medium text-amber-800">사진 변경 요청 검토 안내</p>
          <p className="text-xs text-amber-600 mt-0.5">학생이 업로드한 정면, 좌측, 우측 사진을 확인하고 얼굴 인식에 적합한지 검토해주세요. 승인 시 기존 얼굴 데이터가 새 사진으로 교체됩니다.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 font-medium">대기 중인 요청</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{pendingTotal}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 font-medium">처리 완료</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{completedTotal}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary-dark" strokeWidth={1.5} />
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
                activeTab === "pending"
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              대기 중 ({pendingTotal})
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "processed"
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              처리 완료 ({completedTotal})
            </button>
          </div>

          <div className="relative w-full sm:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="학생명, 학번으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-zinc-400">불러오는 중...</div>
          ) : activeTab === "pending" ? (
            filteredPending.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPending.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          {request.studentName}
                          <span className="text-xs text-zinc-400 font-normal">({request.studentNum})</span>
                        </h3>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Photo Thumbnails */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {request.photos.map((photo) => (
                        <div key={photo.orientation} className="aspect-[3/4] rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                          <PhotoThumbnail src={getPhotoUrl(photo.url)} alt={photo.orientation} />
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-zinc-400 mb-4">요청일: {request.requestDate}</div>

                    <button
                      onClick={() => handleViewDetail(request.requestId)}
                      disabled={detailLoading}
                      className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Image className="w-4 h-4" strokeWidth={1.5} /> 상세 검토하기
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-zinc-500">대기 중인 사진 변경 요청이 없습니다</p>
                <p className="text-xs text-zinc-400 mt-1">모든 요청을 처리했습니다.</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filteredCompleted.length > 0 ? (
                filteredCompleted.map((request, index) => (
                  <motion.div
                    key={`${request.studentNum}-${index}`}
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
                        {request.studentName} <span className="text-zinc-400 text-xs font-normal">({request.studentNum})</span>
                      </div>
                      <div className="text-sm text-zinc-500">
                        {request.accessDate}
                      </div>
                      <div className="flex justify-start">
                        {getStatusBadge(request.status)}
                      </div>
                      <div>
                        {request.rejectReason && (
                          <span className="text-xs text-rose-600">사유: {request.rejectReason}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">처리된 요청이 없습니다</p>
                  <p className="text-xs text-zinc-400 mt-1">처리된 사진 변경 요청 내역이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={spring}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90dvh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-500" strokeWidth={1.5} /> 사진 변경 요청 검토
                </h3>
                <button onClick={() => { setSelectedDetail(null); setRejectReason(""); }} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">학생 정보</div>
                    <div className="font-semibold text-zinc-900 text-lg">{selectedDetail.studentName}</div>
                    <div className="text-sm text-zinc-500 mt-0.5">{selectedDetail.studentNum}</div>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">요청일</div>
                    <div className="font-semibold text-zinc-900">{selectedDetail.requestDate}</div>
                  </div>
                </div>

                {/* Current Photos */}
                <div>
                  <div className="text-sm font-medium text-zinc-700 mb-3">현재 등록된 사진</div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDetail.currentPhotos.map((photo) => (
                      <div key={photo.orientation} className="flex flex-col items-center gap-2">
                        <div className="w-full aspect-[3/4] rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200">
                          <PhotoThumbnail src={getPhotoUrl(photo.url)} alt={photo.orientation} />
                        </div>
                        <span className="text-xs font-medium text-zinc-500">{photo.orientation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center text-zinc-300">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <div className="h-px w-12 bg-zinc-200" />
                    변경 요청
                    <div className="h-px w-12 bg-zinc-200" />
                  </div>
                </div>

                {/* Requested Photos */}
                <div>
                  <div className="text-sm font-medium text-zinc-700 mb-3">변경 요청 사진</div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDetail.requestedPhotos.map((photo) => (
                      <div key={photo.orientation} className="flex flex-col items-center gap-2">
                        <div className="w-full aspect-[3/4] rounded-xl bg-zinc-100 overflow-hidden border-2 border-amber-300">
                          <PhotoThumbnail src={getPhotoUrl(photo.url)} alt={photo.orientation} />
                        </div>
                        <span className="text-xs font-medium text-amber-700">{photo.orientation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reject Reason */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-medium text-zinc-700">
                    거절 사유 (거절 시 필수 입력)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none placeholder:text-zinc-400"
                    placeholder="거절 사유를 입력하세요 (예: 사진이 불선명, 얼굴이 가려짐 등)"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleReject}
                    className="flex-1 py-2.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1.5} /> 거절하기
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> 승인하기
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
