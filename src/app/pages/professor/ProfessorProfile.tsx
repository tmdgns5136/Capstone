import { useState } from "react";
import { User, Key, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ProfessorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("임정택");
  const [professorId] = useState("22112312");
  const [department] = useState("컴퓨터과학과");
  const [email] = useState("22112312@sangmyung.kr");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSave = () => {
    if (isEditing && !confirmPassword) {
      toast.error("정보 수정을 위해 비밀번호를 입력해주세요");
      return;
    }
    setIsEditing(false);
    setConfirmPassword("");
    toast.success("정보가 저장되었습니다");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConfirmPassword("");
  };

  const handleSubmitPasswordChange = () => {
    if (!currentPwd || !newPwd || !confirmNewPwd) {
      toast.error("모든 칸을 입력해주세요");
      return;
    }
    if (newPwd !== confirmNewPwd) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }
    toast.success("비밀번호가 변경되었습니다");
    setIsPasswordModalOpen(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmNewPwd("");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
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
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className={`w-full rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${!isEditing ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : "bg-white"}`}
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
            <label className="text-sm font-medium text-zinc-700 mb-1 block">이메일</label>
            <input
              value={email}
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>

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
                정보 저장하기
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

      {/* 서비스 탈퇴 */}
      <div className="text-right pb-8">
        <button className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2">서비스탈퇴</button>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-zinc-400" /> 비밀번호 변경
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">현재 비밀번호</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="w-full rounded-lg border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showCurrentPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">새 비밀번호</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full rounded-lg border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showNewPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">새 비밀번호 확인</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmNewPwd}
                    onChange={(e) => setConfirmNewPwd(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="w-full rounded-lg border border-zinc-200 p-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showConfirmPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-sm text-zinc-500 px-4 py-2 hover:text-zinc-700"
              >
                취소
              </button>
              <button
                onClick={handleSubmitPasswordChange}
                className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-800"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
