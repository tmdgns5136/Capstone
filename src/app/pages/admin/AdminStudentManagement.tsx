import { useState } from "react";
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

const spring = { type: "spring", stiffness: 100, damping: 20 };

const studentsData = [
  { id: 1, studentId: "20240101", name: "김철수", email: "kim@university.ac.kr", dept: "컴퓨터공학과", grade: 3 },
  { id: 2, studentId: "20240102", name: "이영희", email: "lee@university.ac.kr", dept: "컴퓨터공학과", grade: 3 },
  { id: 3, studentId: "20240103", name: "박민수", email: "park@university.ac.kr", dept: "전자공학과", grade: 2 },
  { id: 4, studentId: "20240104", name: "정수진", email: "jung@university.ac.kr", dept: "기계공학과", grade: 4 },
];

export default function AdminStudentManagement() {
  const [students, setStudents] = useState(studentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<(typeof studentsData)[0] | null>(null);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [grade, setGrade] = useState("");

  const filteredStudents = students.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.studentId.includes(searchQuery) ||
      s.email.includes(searchQuery) ||
      s.dept.includes(searchQuery),
  );

  const resetForm = () => {
    setStudentId("");
    setName("");
    setEmail("");
    setDept("");
    setGrade("");
  };

  const handleAdd = () => {
    if (!studentId || !name || !email || !dept || !grade) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }
    setStudents([...students, { id: students.length + 1, studentId, name, email, dept, grade: parseInt(grade) }]);
    toast.success("학생이 추가되었습니다");
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (student: (typeof studentsData)[0]) => {
    setEditingStudent(student);
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);
    setDept(student.dept);
    setGrade(student.grade.toString());
  };

  const handleUpdate = () => {
    if (!editingStudent) return;
    setStudents(students.map((s) =>
      s.id === editingStudent.id ? { ...s, studentId, name, email, dept, grade: parseInt(grade) } : s,
    ));
    toast.success("학생 정보가 수정되었습니다");
    resetForm();
    setEditingStudent(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setStudents(students.filter((s) => s.id !== id));
      toast.success("학생이 삭제되었습니다");
    }
  };

  const handleExportToExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error("내보낼 데이터가 없습니다.");
      return;
    }
    const exportData = filteredStudents.map((s) => ({
      학번: s.studentId, 이름: s.name, 이메일: s.email, 학과: s.dept, 학년: s.grade,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "학생 목록");
    XLSX.writeFile(workbook, "학생목록_내보내기.xlsx");
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  const handleFormChange = (field: string, value: string) => {
    const setters: Record<string, (v: string) => void> = { studentId: setStudentId, name: setName, email: setEmail, dept: setDept, grade: setGrade };
    setters[field]?.(value);
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
                <FormInput label="학번" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="20240101" />
                <FormInput label="이름" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
                <FormInput label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hong@university.ac.kr" />
                <FormInput label="학과" value={dept} onChange={(e) => setDept(e.target.value)} placeholder="컴퓨터공학과" />
                <FormInput label="학년" type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="3" />
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
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="이름, 학번, 이메일, 학과로 검색..." />
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
            {filteredStudents.length}명
          </span>
        </div>
        <AdminStudentTable
          students={filteredStudents}
          editingStudent={editingStudent}
          form={{ studentId, name, email, dept, grade }}
          onEdit={handleEdit}
          onCancelEdit={() => setEditingStudent(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onFormChange={handleFormChange}
        />
      </motion.div>
    </div>
  );
}
