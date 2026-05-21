import { useState, useRef, useEffect } from "react";
import { User, Camera, Key, Eye, EyeOff, Upload, Trash2, CheckCircle, Info, Clock, XCircle, FileText, Phone, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { checkPassword } from "../../api/auth";
import {
  getProfile,
  updateProfile,
  changePasswordMypage,
  requestPhotoChange,
  getPhotoRequests,
  withdraw,
  type ProfileData,
  type PhotoRequestItem,
} from "../../api/mypage";
import { formatPhone } from "../../utils/format";

const faceGuideImages: Record<string, string> = {
  front: "/guideline/정면.png",
  left: "/guideline/좌측.png",
  right: "/guideline/우측.png",
};

export default function StudentProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile data from API
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [faceStatus, setFaceStatus] = useState<string>("");
  const [profileImages, setProfileImages] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Photo change request modal state
  const [isPhotoHistoryOpen, setIsPhotoHistoryOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<{ front: string | null; left: string | null; right: string | null }>({ front: null, left: null, right: null });
  const [photoFileObjects, setPhotoFileObjects] = useState<{ front: File | null; left: File | null; right: File | null }>({ front: null, left: null, right: null });
  const [photoPwd, setPhotoPwd] = useState("");
  const [showPhotoPwd, setShowPhotoPwd] = useState(false);
  const fileRefs = { front: useRef<HTMLInputElement>(null), left: useRef<HTMLInputElement>(null), right: useRef<HTMLInputElement>(null) };
  const [myPhotoRequests, setMyPhotoRequests] = useState<PhotoRequestItem[]>([]);

  // 프로필 조회 (1-5)
  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        const d = res.data;
        setName(d.userName);
        setStudentId(d.userNum);
        setDepartment(d.major || "");
        setEmail(d.userEmail);
        setPhone(d.phoneNum ? formatPhone(d.phoneNum) : "");
        setFaceStatus(d.faceRegistrationsStatus);
        const imgs: Record<string, string> = {};
        d.profileImages?.forEach((img) => {
          imgs[img.orientation] = img.url;
        });
        setProfileImages(imgs);
      } catch {
        // API 실패 시 빈 상태 유지
      }
      // 사진 변경 요청 내역도 함께 로드
      try {
        const reqRes = await getPhotoRequests();
        setMyPhotoRequests(reqRes.data);
      } catch { }
    })();
  }, []);

  // 사진 변경 요청 내역 조회 (1-5-4)
  const fetchPhotoRequests = async () => {
    try {
      const res = await getPhotoRequests();
      setMyPhotoRequests(res.data);
    } catch {
      // 내역 없으면 빈 배열 유지
    }
  };

  const resizeImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = dataUrl;
    });
  };

  const handlePhotoSelect = (key: "front" | "left" | "right", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("파일 크기는 10MB 이하여야 합니다"); return; }
    setPhotoFileObjects((prev) => ({ ...prev, [key]: file }));
    const reader = new FileReader();
    reader.onload = async () => {
      const resized = await resizeImage(reader.result as string, 400, 533);
      setPhotoFiles((prev) => ({ ...prev, [key]: resized }));
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async () => {
    if (!photoFileObjects.front || !photoFileObjects.left || !photoFileObjects.right) { toast.error("3장의 사진을 모두 등록해주세요"); return; }
    if (!photoPwd) { toast.error("비밀번호를 입력해주세요"); return; }

    try {
      await checkPassword(photoPwd);
    } catch {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!confirm("정말 변경 요청을 하시겠습니까?\n\n사진 변경은 1일 1회로 제한됩니다.")) return;

    setLoading(true);
    try {
      await requestPhotoChange(photoFileObjects.left, photoFileObjects.front, photoFileObjects.right);
      toast.success("사진 변경 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.");
      setIsPhotoModalOpen(false);
      setPhotoFiles({ front: null, left: null, right: null });
      setPhotoFileObjects({ front: null, left: null, right: null });
      setPhotoPwd("");
      fetchPhotoRequests();
    } catch (err: any) {
      toast.error(err.message || "사진 변경 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setPhotoFiles({ front: null, left: null, right: null });
    setPhotoFileObjects({ front: null, left: null, right: null });
    setPhotoPwd("");
  };

  const handleSave = async () => {
    if (isEditing && !confirmPassword) {
      toast.error("정보 수정을 위해 비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      await checkPassword(confirmPassword);
      await updateProfile(phone);
      setIsEditing(false);
      setConfirmPassword("");
      toast.success("정보가 저장되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "정보 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConfirmPassword("");
  };

  const handleSubmitPasswordChange = async () => {
    if (!currentPwd || !newPwd || !confirmNewPwd) {
      toast.error("모든 칸을 입력해주세요");
      return;
    }
    if (newPwd !== confirmNewPwd) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }

    setLoading(true);
    try {
      await checkPassword(currentPwd);
      await changePasswordMypage(newPwd);
      toast.success("비밀번호가 변경되었습니다.");
      setIsPasswordModalOpen(false);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmNewPwd("");
    } catch (err: any) {
      toast.error(err.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-zinc-900">마이페이지</h1>

      {/* 기본 정보 관리 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" /> 기본 정보 관리
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-primary hover:text-primary-hover border border-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              정보 수정
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">이름</label>
            <input
              value={name}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">학번</label>
            <input
              value={studentId}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">이메일</label>
            <input
              value={email}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-zinc-400" /> 전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              disabled={!isEditing}
              className={`w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${!isEditing ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : "bg-white"
                }`}
            />
          </div>
        </div>

        {/* Edit mode: password confirmation */}
        {isEditing && (
          <div className="mt-5 pt-4 border-t border-zinc-100 space-y-4">
            <div>
              <label className="text-sm font-medium text-rose-500 mb-1 block flex items-center gap-1">
                <Key className="w-3.5 h-3.5" /> 정보 수정을 위해 현재 비밀번호를 입력해주세요
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="현재 비밀번호"
                className="w-full rounded-lg border border-zinc-200 p-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-zinc-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-zinc-800"
              >
                저장하기
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-white text-zinc-700 text-sm font-medium py-3 rounded-lg border border-zinc-200 hover:bg-zinc-50"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="mt-5 pt-4 border-t border-zinc-100">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-sm text-primary hover:text-primary-hover font-medium underline underline-offset-2 flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" /> 비밀번호변경
            </button>
          </div>
        )}
      </div>

      {/* 얼굴 인식 데이터 관리 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-1">얼굴 인식 데이터 관리</h2>
        <p className="text-sm text-zinc-400 mb-6">현재 등록된 얼굴 데이터입니다. <br />*등록된 사진이 없을 경우에 출결이 불가하니 반드시 등록해주세요.</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "정면", icon: "face", imgUrl: profileImages.CENTER },
            { label: "좌측", icon: "phone-left", imgUrl: profileImages.LEFT },
            { label: "우측", icon: "phone-right", imgUrl: profileImages.RIGHT },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden flex flex-col items-center">
              <div className="w-full aspect-[3/4] bg-zinc-100 flex items-center justify-center overflow-hidden">
                {item.imgUrl ? (
                  <img
                    src={item.imgUrl}
                    alt={item.label}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-zinc-300 text-xs">이미지 없음</div>';
                    }}
                  />
                ) : (
                  <span className="text-zinc-300 text-xs">이미지 없음</span>
                )}
              </div>
              <span className="text-sm font-medium text-zinc-600 py-3">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { fetchPhotoRequests(); setIsPhotoHistoryOpen(true); }}
            className="flex-1 bg-white text-zinc-700 text-sm font-medium py-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> 요청 내역 확인
            {myPhotoRequests.filter(r => r.status === "PENDING").length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {myPhotoRequests.filter(r => r.status === "PENDING").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="flex-1 bg-zinc-100 text-zinc-700 text-sm font-medium py-3 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> 사진 변경 요청하기
          </button>
        </div>

        {faceStatus && (
          <p className="text-xs text-zinc-400 text-center mt-3">
            얼굴 등록 상태: {faceStatus === "APPROVED" ? "승인됨" : faceStatus === "PENDING" ? "대기 중" : "거절됨"}
          </p>
        )}
      </div>

      {/* 회원 탈퇴 (1-7) */}
      <div className="text-right pb-8">
        <button
          onClick={async () => {
            if (!confirm("정말 탈퇴하시겠습니까?\n\n탈퇴 후 복구할 수 없습니다.")) return;
            try {
              await withdraw();
              toast.success("회원 탈퇴가 완료되었습니다.");
              logout();
              navigate("/login");
            } catch (err: any) {
              toast.error(err.message || "회원 탈퇴에 실패했습니다.");
            }
          }}
          className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2"
        >
          회원탈퇴
        </button>
      </div>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
          <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
            <DialogTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-zinc-400" /> 비밀번호 변경
            </DialogTitle>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1.5 block">현재 비밀번호</label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                  className="w-full rounded-xl border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showCurrentPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1.5 block">새 비밀번호</label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  className="w-full rounded-xl border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showNewPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1.5 block">새 비밀번호 확인</label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmNewPwd}
                  onChange={(e) => setConfirmNewPwd(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className="w-full rounded-xl border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showConfirmPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="text-sm text-zinc-500 px-4 py-2 hover:text-zinc-700 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmitPasswordChange}
              className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              변경
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Change Request Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={(open) => { if (!open) closePhotoModal(); }}>
        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-lg max-h-[90dvh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
            <DialogTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-zinc-400" /> 사진 변경 요청
            </DialogTitle>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-zinc-500">새로 등록할 얼굴 사진 3장을 업로드해주세요. 관리자 승인 후 반영됩니다.</p>

            {/* Guideline Info */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-sky-800">촬영 가이드라인</p>
                <ul className="text-xs text-sky-700 space-y-1 leading-relaxed">
                  <li>- 주변에 사람이 없는 밝은 곳에서 촬영한 사진을 사용해주세요</li>
                  <li>- 얼굴이 사진의 중앙에 위치하도록 해주세요</li>
                  <li>- 모자, 선글라스 등 얼굴을 가리는 액세서리를 제거해주세요</li>
                  <li>- JPG, PNG 형식 / 10MB 이하 파일만 업로드 가능합니다</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {([
                { key: "front" as const, label: "정면 (Front)" },
                { key: "left" as const, label: "왼쪽 30°" },
                { key: "right" as const, label: "오른쪽 30°" },
              ]).map((slot) => (
                <div key={slot.key} className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => fileRefs[slot.key].current?.click()}
                    className={`w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${photoFiles[slot.key]
                      ? "border-primary bg-primary/5"
                      : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100"
                      }`}
                  >
                    {photoFiles[slot.key] ? (
                      <div className="relative w-full h-full group">
                        <img src={photoFiles[slot.key]!} alt={slot.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40 transition-colors flex items-center justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPhotoFiles((prev) => ({ ...prev, [slot.key]: null })); setPhotoFileObjects((prev) => ({ ...prev, [slot.key]: null })); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-primary drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-20 opacity-40 mb-2">
                          <img src={faceGuideImages[slot.key]} alt={`${slot.label} 가이드`} className="w-full h-full object-contain" />
                        </div>
                        <Upload className="w-4 h-4 text-zinc-400 mb-0.5" />
                        <span className="text-[11px] text-zinc-400">파일 선택</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRefs[slot.key]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(slot.key, e)}
                  />
                  <span className="text-xs font-medium text-zinc-600">{slot.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <label className="text-sm font-medium text-zinc-700 mb-1 block flex items-center gap-1">
                <Key className="w-3.5 h-3.5" /> 본인 확인을 위해 비밀번호를 입력해주세요
              </label>
              <div className="relative">
                <input
                  type={showPhotoPwd ? "text" : "password"}
                  value={photoPwd}
                  onChange={(e) => setPhotoPwd(e.target.value)}
                  placeholder="현재 비밀번호"
                  className="w-full rounded-xl border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPhotoPwd(!showPhotoPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPhotoPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
            <button
              onClick={closePhotoModal}
              className="text-sm text-zinc-500 px-4 py-2 hover:text-zinc-700 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePhotoSubmit}
              className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> 변경 요청
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Request History Modal */}
      <Dialog open={isPhotoHistoryOpen} onOpenChange={setIsPhotoHistoryOpen}>
        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-lg max-h-[90dvh] flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl shrink-0">
            <DialogTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-400" /> 사진 변경 요청 내역
            </DialogTitle>
          </div>
          <div className="p-6 overflow-y-auto">
            {myPhotoRequests.length > 0 ? (
              <div className="space-y-4">
                {myPhotoRequests.map((req) => (
                  <div key={req.requestId} className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">{req.requestDate}</span>
                      {req.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" /> 대기 중
                        </span>
                      ) : req.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                          <CheckCircle className="w-3 h-3" /> 승인
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
                          <XCircle className="w-3 h-3" /> 거절
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["CENTER", "LEFT", "RIGHT"] as const).map((dir) => {
                        const img = req.profileImages?.find((i) => i.orientation === dir);
                        const altText = dir === "CENTER" ? "정면" : dir === "LEFT" ? "좌측" : "우측";
                        return (
                          <div key={dir} className="aspect-[3/4] rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                            {img ? (
                              <img
                                src={img.url}
                                alt={altText}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                                    '<div class="w-full h-full flex items-center justify-center text-zinc-300 text-xs">이미지 없음</div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">이미지 없음</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {req.status === "REJECTED" && req.rejectReason && (
                      <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
                        <span className="font-medium text-rose-500">거절 사유: </span>{req.rejectReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-500">요청 내역이 없습니다</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
