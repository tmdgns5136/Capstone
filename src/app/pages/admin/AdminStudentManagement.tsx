import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Users, Plus, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { SearchInput } from "../../components/SearchInput";
import { FormInput } from "../../components/FormInput";
import { AdminStudentTable } from "./AdminStudentTable";
import { api } from "../../api/client";

const spring = { type: "spring", stiffness: 100, damping: 20 };

interface Student {
  userId: number;
  userNum: string;
  userName: string;
  userEmail: string;
  phoneNum: string;
  status: string;
}

interface PageResponse {
  content: Student[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

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

  // 수정 폼
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const fetchStudents = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await api<any>(`/api/admin/students?page=${page}&size=30`);
      const pageData: PageResponse = res.data;
      setStudents(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setCurrentPage(pageData.number);
    } catch (e: any) {
      toast.error(e.message || "학생 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(
    (s) =>
      s.userName.includes(searchQuery) ||
      s.userNum.includes(searchQuery) ||
      s.userEmail.includes(searchQuery) ||
      (s.phoneNum && s.phoneNum.includes(searchQuery)),
  );

  const resetForm = () => {
    setUserNum("");
    setUserName("");
    setUserEmail("");
    setPassword("");
    setPhoneNum("");
  };

  const handleAdd = async () => {
    if (!userNum || !userName || !userEmail || !password || !phoneNum) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }
    try {
      await api("/api/admin/students/register", {
        method: "POST",
        body: JSON.stringify({ userNum, userName, userEmail, password, phoneNum }),
      });
      toast.success("학생이 등록되었습니다");
      resetForm();
      setIsAddDialogOpen(false);
      fetchStudents(currentPage);
    } catch (e: any) {
      toast.error(e.message || "학생 등록에 실패했습니다.");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.userName);
    setEditEmail(student.userEmail);
    setEditPhone(student.phoneNum || "");
    setEditStatus(student.status || "");
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    try {
      await api(`/api/admin/students/${editingStudent.userNum}/edit`, {
        method: "PATCH",
        body: JSON.stringify({
          userName: editName,
          email: editEmail,
          phoneNum: editPhone,
          status: editStatus,
        }),
      });
      toast.success("학생 정보가 수정되었습니다");
      setEditingStudent(null);
      fetchStudents(currentPage);
    } catch (e: any) {
      toast.error(e.message || "학생 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (studentNum: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api(`/api/admin/students/${studentNum}/delete`, {
        method: "DELETE",
      });
      toast.success("학생이 삭제되었습니다");
      fetchStudents(currentPage);
    } catch (e: any) {
      toast.error(e.message || "학생 삭제에 실패했습니다.");
    }
  };

  const handleExportToExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error("내보낼 데이터가 없습니다.");
      return;
    }
    const exportData = filteredStudents.map((s) => ({
      학번: s.userNum,
      이름: s.userName,
      이메일: s.userEmail,
      전화번호: s.phoneNum,
      상태: s.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "학생 목록");
    XLSX.writeFile(workbook, "학생목록_내보내기.xlsx");
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
          <h1 className="text-3xl font-bold text-zinc-900">학생 관리</h1>
          <p className="text-sm text-zinc-400 mt-1">전체 학생을 조회, 추가, 수정, 삭제할 수 있습니다</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportToExcel}
            className="bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} /> 목록 내보내기
          </button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <button className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" strokeWidth={1.5} /> 학생 추가
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
              <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                <DialogTitle className="text-lg font-semibold text-zinc-900">새 학생 추가</DialogTitle>
                <DialogDescription className="text-sm text-zinc-400 mt-1">학생 정보를 입력하세요</DialogDescription>
              </div>
              <div className="p-6 space-y-4">
                <FormInput label="학번" value={userNum} onChange={(e) => setUserNum(e.target.value)} placeholder="202110001" />
                <FormInput label="이름" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="홍길동" />
                <FormInput label="이메일" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="hong@example.com" />
                <FormInput label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="영문+숫자 8자 이상" />
                <FormInput label="전화번호" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} placeholder="010-1234-5678" />
                <button
                  onClick={handleAdd}
                  className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2"
                >
                  추가하기
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
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="이름, 학번, 이메일, 전화번호로 검색..." />
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-900">학생 목록</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-700">
            {totalElements}명
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-400">불러오는 중...</div>
        ) : (
          <AdminStudentTable
            students={filteredStudents}
            editingStudent={editingStudent}
            editForm={{ name: editName, email: editEmail, phoneNum: editPhone, status: editStatus }}
            onEdit={handleEdit}
            onCancelEdit={() => setEditingStudent(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEditFormChange={(field, value) => {
              if (field === "name") setEditName(value);
              else if (field === "email") setEditEmail(value);
              else if (field === "phoneNum") setEditPhone(value);
              else if (field === "status") setEditStatus(value);
            }}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-center gap-2">
            <button
              onClick={() => fetchStudents(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
            >
              이전
            </button>
            <span className="text-sm text-zinc-600">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => fetchStudents(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
