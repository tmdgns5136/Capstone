import { motion } from "motion/react";
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../../components/ui/dialog";
import { FormInput } from "../../components/FormInput";

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  dept: string;
  grade: number;
}

interface FormState {
  studentId: string;
  name: string;
  email: string;
  dept: string;
  grade: string;
}

interface AdminStudentTableProps {
  students: Student[];
  editingStudent: Student | null;
  form: FormState;
  onEdit: (student: Student) => void;
  onCancelEdit: () => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onFormChange: (field: keyof FormState, value: string) => void;
}

export function AdminStudentTable({
  students,
  editingStudent,
  form,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onFormChange,
}: AdminStudentTableProps) {
  const editDialogContent = (
    <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
      <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
        <DialogTitle className="text-lg font-semibold text-zinc-900">학생 정보 수정</DialogTitle>
      </div>
      <div className="p-6 space-y-4">
        <FormInput label="학번" value={form.studentId} onChange={(e) => onFormChange("studentId", e.target.value)} disabled />
        <FormInput label="이름" value={form.name} onChange={(e) => onFormChange("name", e.target.value)} />
        <FormInput label="이메일" value={form.email} onChange={(e) => onFormChange("email", e.target.value)} />
        <FormInput label="학과" value={form.dept} onChange={(e) => onFormChange("dept", e.target.value)} />
        <FormInput label="학년" type="number" value={form.grade} onChange={(e) => onFormChange("grade", e.target.value)} />
        <button
          onClick={onUpdate}
          className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2"
        >
          수정하기
        </button>
      </div>
    </DialogContent>
  );

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left min-w-[650px]">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">학번</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">이름</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">이메일</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">학과</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-center">학년</th>
              <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{student.studentId}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{student.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{student.email}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{student.dept}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                    {student.grade}학년
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex justify-end gap-1.5">
                    <Dialog
                      open={editingStudent?.id === student.id}
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
                      onClick={() => onDelete(student.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
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
            key={student.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-xl border border-zinc-200 p-4 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{student.name}</p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{student.studentId}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Dialog
                  open={editingStudent?.id === student.id}
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
                  onClick={() => onDelete(student.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 truncate">{student.email}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{student.dept}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                {student.grade}학년
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
