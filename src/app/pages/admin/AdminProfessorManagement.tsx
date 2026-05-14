import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { UserCircle, Plus, Search, Edit, Trash2, Download, Eye, EyeOff } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { api } from "../../api/client";
import { formatPhone } from "../../utils/format";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

interface Professor {
  userId: number;
  userNum: string;
  userName: string;
  userEmail: string;
  phoneNum: string;
  status: string;
}

interface PageResponse {
  content: Professor[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const statusLabel = (status: string) => {
  switch (status) {
    case "EMPLOYED": return "재직";
    case "RETIRED": return "퇴직";
    case "LEAVE": return "휴직";
    default: return status || "-";
  }
};

export default function AdminProfessorManagement() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 추가 폼
  const [userNum, setUserNum] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 수정 폼
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  const fetchProfessors = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await api<any>(`/api/admin/professors?page=${page}&size=30`);
      const pageData: PageResponse = res.data;
      setProfessors(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setCurrentPage(pageData.number);
    } catch (e: any) {
      toast.error(e.message || "교수 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const filteredProfessors = professors.filter(
    (p) =>
      p.userName.includes(searchQuery) ||
      p.userNum.includes(searchQuery) ||
      p.userEmail.includes(searchQuery) ||
      (p.phoneNum && p.phoneNum.includes(searchQuery)),
  );

  const resetForm = () => {
    setUserNum("");
    setUserName("");
    setUserEmail("");
    setPassword("");
    setPhoneNum("");
    setShowPassword(false);
  };

  const handleAdd = async () => {
    if (!userNum || !userName || !userEmail || !password || !phoneNum) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }
    if (!/^\d{6}$/.test(userNum)) {
      toast.error("사번은 6자리 숫자여야 합니다");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      toast.error("올바른 이메일 형식을 입력해주세요");
      return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
      toast.error("비밀번호는 영문+숫자 포함 8자 이상이어야 합니다");
      return;
    }
    const phoneDigits = phoneNum.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      toast.error("전화번호를 올바르게 입력해주세요");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await api("/api/admin/professors/register", {
        method: "POST",
        body: JSON.stringify({ userNum, userName, userEmail, password, phoneNum: phoneNum.replace(/\D/g, "") }),
      });
      toast.success("교수가 등록되었습니다.");
      resetForm();
      setIsAddDialogOpen(false);
      fetchProfessors(currentPage);
    } catch (e: any) {
      toast.error(e.message || "교수 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setEditName(professor.userName);
    setEditEmail(professor.userEmail);
    setEditPhone(professor.phoneNum || "");
    setEditStatus(professor.status || "");
    setEditPassword("");
    setShowEditPassword(false);
  };

  const handleUpdate = async () => {
    if (!editingProfessor || submitting) return;
    setSubmitting(true);
    try {
      const body: any = {
        userName: editName,
        email: editEmail,
        phoneNum: editPhone.replace(/\D/g, ""),
        status: editStatus,
      };
      if (editPassword) body.password = editPassword;
      await api(`/api/admin/professors/${editingProfessor.userNum}/edit`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast.success("교수 정보가 수정되었습니다.");
      setEditingProfessor(null);
      fetchProfessors(currentPage);
    } catch (e: any) {
      toast.error(e.message || "교수 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || submitting) return;
    setSubmitting(true);
    try {
      await api(`/api/admin/professors/${deleteTarget}/delete`, {
        method: "DELETE",
      });
      toast.success("교수가 삭제되었습니다.");
      fetchProfessors(currentPage);
    } catch (e: any) {
      toast.error(e.message || "교수 삭제에 실패했습니다.");
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const handleExportToExcel = () => {
    if (filteredProfessors.length === 0) {
      toast.error("내보낼 데이터가 없습니다.");
      return;
    }
    const exportData = filteredProfessors.map((p) => ({
      사번: p.userNum,
      이름: p.userName,
      이메일: p.userEmail,
      전화번호: formatPhone(p.phoneNum),
      상태: p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "교수 목록");
    XLSX.writeFile(workbook, "교수목록_내보내기.xlsx");
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">교수 관리</h1>
          <p className="text-sm text-zinc-400 mt-1">전체 교수를 조회, 추가, 수정, 삭제할 수 있습니다</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportToExcel}
            className="bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} /> 목록 내보내기
          </button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <button className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" strokeWidth={1.5} /> 교수 추가
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
              <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                <DialogTitle className="text-lg font-semibold text-zinc-900">새 교수 추가</DialogTitle>
                <DialogDescription className="text-sm text-zinc-400 mt-1">교수 정보를 입력하세요</DialogDescription>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700">사번</Label>
                  <input
                    value={userNum}
                    onChange={(e) => setUserNum(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700">이름</Label>
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="홍교수"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700">이메일</Label>
                  <input
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="prof@smu.ac.kr"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700">비밀번호</Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="영문+숫자 8자 이상"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700">전화번호</Label>
                  <input
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(formatPhone(e.target.value))}
                    placeholder="010-1234-5678"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={submitting}
                  className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "처리 중..." : "등록하기"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
        className="bg-white rounded-xl border border-zinc-200 p-4"
      >
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            strokeWidth={1.5}
          />
          <input
            placeholder="이름, 사번, 이메일, 전화번호로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </motion.div>

      {/* Professors Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-900">교수 목록</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-700">
            {totalElements}명
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-400">불러오는 중...</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">사번</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">이름</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">이메일</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">전화번호</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-center">상태</th>
                    <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessors.map((professor, index) => (
                    <motion.tr
                      key={professor.userNum}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{professor.userNum}</td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{professor.userName}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{professor.userEmail}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{formatPhone(professor.phoneNum)}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                          {statusLabel(professor.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex justify-end gap-1.5">
                          <Dialog
                            open={editingProfessor?.userNum === professor.userNum}
                            onOpenChange={(open) => !open && setEditingProfessor(null)}
                          >
                            <DialogTrigger asChild>
                              <button
                                onClick={() => handleEdit(professor)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                              >
                                <Edit className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
                              <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                                <DialogTitle className="text-lg font-semibold text-zinc-900">교수 정보 수정</DialogTitle>
                              </div>
                              <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-zinc-700">사번</Label>
                                  <input
                                    value={editingProfessor?.userNum || ""}
                                    disabled
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm cursor-not-allowed opacity-60"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-zinc-700">이름</Label>
                                  <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-zinc-700">이메일</Label>
                                  <input
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-zinc-700">전화번호</Label>
                                  <input
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                                    placeholder="010-1234-5678"
                                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-zinc-700">상태</Label>
                                  <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                  >
                                    <option value="EMPLOYED">재직</option>
                                    <option value="RETIRED">퇴직</option>
                                    <option value="LEAVE">휴직</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-zinc-700">비밀번호 변경</Label>
                                  <div className="relative">
                                    <input
                                      type={showEditPassword ? "text" : "password"}
                                      value={editPassword}
                                      onChange={(e) => setEditPassword(e.target.value)}
                                      placeholder="변경할 비밀번호 입력 (미입력 시 유지)"
                                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowEditPassword(!showEditPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                      {showEditPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                                <button
                                  onClick={handleUpdate}
                                  disabled={submitting}
                                  className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {submitting ? "처리 중..." : "수정하기"}
                                </button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <button
                            onClick={() => setDeleteTarget(professor.userNum)}
                            disabled={submitting}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredProfessors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-400">
                        검색 결과가 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden p-4 space-y-3">
              {filteredProfessors.map((professor, index) => (
                <motion.div
                  key={professor.userNum}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-xl border border-zinc-200 p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{professor.userName}</p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{professor.userNum}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Dialog
                        open={editingProfessor?.userNum === professor.userNum}
                        onOpenChange={(open) => !open && setEditingProfessor(null)}
                      >
                        <DialogTrigger asChild>
                          <button
                            onClick={() => handleEdit(professor)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
                          <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                            <DialogTitle className="text-lg font-semibold text-zinc-900">교수 정보 수정</DialogTitle>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">사번</Label>
                              <input value={editingProfessor?.userNum || ""} disabled className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm cursor-not-allowed opacity-60" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">이름</Label>
                              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">이메일</Label>
                              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">전화번호</Label>
                              <input value={editPhone} onChange={(e) => setEditPhone(formatPhone(e.target.value))} placeholder="010-1234-5678" className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">상태</Label>
                              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                                <option value="EMPLOYED">재직</option>
                                <option value="RETIRED">퇴직</option>
                                <option value="LEAVE">휴직</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">비밀번호 변경</Label>
                              <div className="relative">
                                <input
                                  type={showEditPassword ? "text" : "password"}
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  placeholder="변경할 비밀번호 입력 (미입력 시 유지)"
                                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditPassword(!showEditPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                  {showEditPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <button onClick={handleUpdate} disabled={submitting} className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                              {submitting ? "처리 중..." : "수정하기"}
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <button
                        onClick={() => setDeleteTarget(professor.userNum)}
                        disabled={submitting}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{professor.userEmail}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{formatPhone(professor.phoneNum)}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                      {statusLabel(professor.status)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {filteredProfessors.length === 0 && (
                <p className="py-12 text-center text-sm text-zinc-400">
                  검색 결과가 없습니다
                </p>
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-center gap-2">
            <button
              onClick={() => fetchProfessors(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
            >
              이전
            </button>
            <span className="text-sm text-zinc-600">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => fetchProfessors(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </motion.div>

      {/* 삭제 확인 Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-sm">
          <div className="p-6 text-center space-y-4">
            <DialogTitle className="text-lg font-semibold text-zinc-900">교수 삭제</DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
