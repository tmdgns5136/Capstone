import { useState, useEffect, useCallback } from "react";
import { User, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog";

export default function ProfessorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 데이터 상태 (백엔드 InquiryData 규격 매칭)
  const [name, setName] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");

  // 취소 시 되돌리기 위한 원본 데이터 저장용
  const [originalData, setOriginalData] = useState<any>(null);

  const [confirmPassword, setConfirmPassword] = useState("");

  // 비밀번호 변경 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // 1. 마이페이지 데이터 불러오기 (@GetMapping)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api("/api/mypage", { method: "GET" });
      const data = res.data;
      
      if (data) {
        setName(data.userName || "");
        setProfessorId(data.userNum || "");
        setDepartment(data.major || "");
        setEmail(data.userEmail || "");
        setPhoneNum(data.phoneNum || "");
        setOriginalData(data); // 취소 대비 원본 저장
      }
    } catch (e: any) {
      toast.error("프로필 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 2. 기본 정보 수정 저장 (@PatchMapping("/info-change"))
  const handleSave = async () => {
    if (isEditing && !confirmPassword) {
      toast.error("정보 수정을 위해 현재 비밀번호를 입력해주세요");
      return;
    }

    try {
      await api("/api/mypage/info-change", {
        method: "PATCH",
        body: JSON.stringify({
          userEmail: email,
          phoneNum: phoneNum,
        }),
      });
      
      toast.success("프로필 정보 변경이 완료되었습니다.");
      setIsEditing(false);
      setConfirmPassword("");
      fetchProfile(); // 갱신된 정보 다시 불러오기
    } catch (e: any) {
      toast.error(e.message || "정보 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConfirmPassword("");
    if (originalData) {
      setEmail(originalData.userEmail || "");
      setPhoneNum(originalData.phoneNum || "");
    }
  };

  // 3. 비밀번호 변경 (@PatchMapping("/password-change"))
  const handleSubmitPasswordChange = async () => {
    if (!currentPwd || !newPwd || !confirmNewPwd) {
      toast.error("모든 칸을 입력해주세요");
      return;
    }
    if (newPwd !== confirmNewPwd) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }

    try {
      await api("/api/mypage/password-change", {
        method: "PATCH",
        body: JSON.stringify({
          newPassword: newPwd, // EditRequest 규격
        }),
      });
      
      toast.success("비밀번호 변경이 완료되었습니다.");
      setIsPasswordModalOpen(false);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmNewPwd("");
    } catch (e: any) {
      toast.error(e.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  // 4. 회원 탈퇴 (@PostMapping("/withdraw"))
  const handleWithdraw = async () => {
    if (!confirm("정말 서비스에서 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.")) {
      return;
    }

    try {
      // 🚨 컨트롤러에 PostMapping으로 되어있으므로 POST 사용
      const res = await api("/api/mypage/withdraw", { method: "POST" });
      toast.success(res.message || "회원 탈퇴가 성공적으로 처리되었습니다.");
      
      // 탈퇴 성공 시 로그인 페이지로 이동
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "탈퇴 처리에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      프로필 정보를 불러오는 중...
    </div>;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-900">마이페이지</h1>

      {/* 기본 정보 관리 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">이름</label>
            <input
              value={name}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">사번</label>
            <input
              value={professorId}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">학과</label>
            <input
              value={department}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block flex items-center gap-1">
              이메일 {isEditing && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">수정 가능</span>}
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
              className={`w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${!isEditing ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : "bg-white"}`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-zinc-700 mb-1 block flex items-center gap-1">
              전화번호 {isEditing && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">수정 가능</span>}
            </label>
            <input
              value={phoneNum}
              onChange={(e) => setPhoneNum(e.target.value)}
              disabled={!isEditing}
              placeholder="예: 010-1234-5678"
              className={`w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${!isEditing ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : "bg-white"}`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 pt-5 border-t border-zinc-100 space-y-4">
            <div>
              <label className="text-sm font-medium text-rose-500 mb-1.5 flex items-center gap-1.5">
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
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-zinc-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                정보 저장하기
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-white text-zinc-700 text-sm font-medium py-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-sm text-primary hover:text-primary-hover font-medium underline underline-offset-2 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> 비밀번호 변경
            </button>
          </div>
        )}
      </div>

      {/* 서비스 탈퇴 */}
      <div className="text-right pb-8">
        <button 
          onClick={handleWithdraw}
          className="text-xs text-zinc-400 hover:text-rose-500 transition-colors underline underline-offset-2"
        >
          서비스 탈퇴
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
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50 rounded-b-2xl">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="text-sm text-zinc-500 font-medium px-4 py-2 hover:text-zinc-800 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmitPasswordChange}
              className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
            >
              비밀번호 변경
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}