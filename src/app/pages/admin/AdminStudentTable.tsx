import { motion } from "motion/react";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../../components/ui/dialog";
import { FormInput } from "../../components/FormInput";
import { formatPhone } from "../../utils/format";

interface Student {
  userId: number;
  userNum: string;
  userName: string;
  userEmail: string;
  phoneNum: string;
  status: string;
}

interface EditFormState {
  name: string;
  email: string;
  phoneNum: string;
  status: string;
  password: string;
}

interface AdminStudentTableProps {
  students: Student[];
  editingStudent: Student | null;
  editForm: EditFormState;
  onEdit: (student: Student) => void;
  onCancelEdit: () => void;
  onUpdate: () => void;
  onDelete: (userNum: string) => void;
  submitting?: boolean;
  onEditFormChange: (field: keyof EditFormState, value: string) => void;
  showEditPassword: boolean;
  onToggleEditPassword: () => void;
}

const formatPhoneDisplay = (value: string) => {
  if (!value) return "-";
  return formatPhone(value);
};

const statusLabel = (status: string) => {
  switch (status) {
    case "ENROLLED": return "재학";
    case "LEAVE": return "휴학";
    case "GRADUATED": return "졸업";
    case "EXPELLED": return "제적";
    default: return status || "-";
  }
};

export function AdminStudentTable({
  students,
  editingStudent,
  editForm,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  submitting,
  onEditFormChange,
  showEditPassword,
  onToggleEditPassword,
}: AdminStudentTableProps) {
  const editDialogContent = (
    <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
      <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
        <DialogTitle className="text-lg font-semibold text-zinc-900">학생 정보 수정</DialogTitle>
      </div>
      <div className="p-6 space-y-4">
        <FormInput label="학번" value={editingStudent?.userNum || ""} onChange={() => {}} disabled />
        <FormInput label="이름" value={editForm.name} onChange={(e) => onEditFormChange("name", e.target.value)} />
        <FormInput label="이메일" value={editForm.email} onChange={(e) => onEditFormChange("email", e.target.value)} />
        <FormInput label="전화번호" value={editForm.phoneNum} onChange={(e) => onEditFormChange("phoneNum", e.target.value)} placeholder="010-1234-5678" />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">비밀번호 변경</label>
          <div className="relative">
            <input
              type={showEditPassword ? "text" : "password"}
              value={editForm.password}
              onChange={(e) => onEditFormChange("password", e.target.value)}
              placeholder="변경할 비밀번호 입력 (미입력 시 유지)"
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={onToggleEditPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">상태</label>
          <select
            value={editForm.status}
            onChange={(e) => onEditFormChange("status", e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="ENROLLED">재학</option>
            <option value="LEAVE">휴학</option>
            <option value="GRADUATED">졸업</option>
            <option value="EXPELLED">제적</option>
          </select>
        </div>
        <button
          onClick={onUpdate}
          disabled={submitting}
          className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "처리 중..." : "수정하기"}
        </button>
      </div>
    </DialogContent>
  );

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">학번</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">이름</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">이메일</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">전화번호</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-center">상태</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <motion.tr
                key={student.userNum}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{student.userNum}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{student.userName}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{student.userEmail}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{formatPhoneDisplay(student.phoneNum)}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                    {statusLabel(student.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex justify-end gap-1.5">
                    <Dialog
                      open={editingStudent?.userNum === student.userNum}
                      onOpenChange={(open) => !open && onCancelEdit()}
                    >
                      <DialogTrigger asChild>
                        <button
                          onClick={() => onEdit(student)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </DialogTrigger>
                      {editDialogContent}
                    </Dialog>
                    <button
                      onClick={() => onDelete(student.userNum)}
                      disabled={submitting}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {students.length === 0 && (
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
        {students.map((student, index) => (
          <motion.div
            key={student.userNum}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-xl border border-zinc-200 p-4 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{student.userName}</p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{student.userNum}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Dialog
                  open={editingStudent?.userNum === student.userNum}
                  onOpenChange={(open) => !open && onCancelEdit()}
                >
                  <DialogTrigger asChild>
                    <button
                      onClick={() => onEdit(student)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </DialogTrigger>
                  {editDialogContent}
                </Dialog>
                <button
                  onClick={() => onDelete(student.userNum)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 truncate">{student.userEmail}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{formatPhoneDisplay(student.phoneNum)}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                {statusLabel(student.status)}
              </span>
            </div>
          </motion.div>
        ))}
        {students.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-400">
            검색 결과가 없습니다
          </p>
        )}
      </div>
    </>
  );
}
