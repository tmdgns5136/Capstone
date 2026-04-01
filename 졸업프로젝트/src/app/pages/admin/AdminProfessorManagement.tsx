import { useState } from "react";
import { motion } from "motion/react";
import { UserCircle, Plus, Search, Edit, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";

const spring = { type: "spring", stiffness: 100, damping: 20 };

const professorsData = [
  {
    id: 1,
    professorId: "P20240001",
    name: "김교수",
    email: "kim.prof@university.ac.kr",
    dept: "컴퓨터공학과",
    courses: 3,
  },
  {
    id: 2,
    professorId: "P20240002",
    name: "이교수",
    email: "lee.prof@university.ac.kr",
    dept: "컴퓨터공학과",
    courses: 2,
  },
  {
    id: 3,
    professorId: "P20240003",
    name: "박교수",
    email: "park.prof@university.ac.kr",
    dept: "전자공학과",
    courses: 4,
  },
  {
    id: 4,
    professorId: "P20240004",
    name: "정교수",
    email: "jung.prof@university.ac.kr",
    dept: "기계공학과",
    courses: 2,
  },
];

export default function AdminProfessorManagement() {
  const [professors, setProfessors] = useState(professorsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<
    (typeof professorsData)[0] | null
  >(null);

  const [professorId, setProfessorId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");

  const filteredProfessors = professors.filter(
    (p) =>
      p.name.includes(searchQuery) ||
      p.professorId.includes(searchQuery) ||
      p.email.includes(searchQuery) ||
      p.dept.includes(searchQuery),
  );

  const handleAdd = () => {
    if (!professorId || !name || !email || !dept) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }

    const newProfessor = {
      id: professors.length + 1,
      professorId,
      name,
      email,
      dept,
      courses: 0,
    };

    setProfessors([...professors, newProfessor]);
    toast.success("교수가 추가되었습니다");
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (professor: (typeof professorsData)[0]) => {
    setEditingProfessor(professor);
    setProfessorId(professor.professorId);
    setName(professor.name);
    setEmail(professor.email);
    setDept(professor.dept);
  };

  const handleUpdate = () => {
    if (!editingProfessor) return;

    setProfessors(
      professors.map((p) =>
        p.id === editingProfessor.id
          ? { ...p, professorId, name, email, dept }
          : p,
      ),
    );
    toast.success("교수 정보가 수정되었습니다");
    resetForm();
    setEditingProfessor(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setProfessors(professors.filter((p) => p.id !== id));
      toast.success("교수가 삭제되었습니다");
    }
  };

  const handleExportToExcel = () => {
    if (filteredProfessors.length === 0) {
      toast.error("내보낼 데이터가 없습니다.");
      return;
    }
    const exportData = filteredProfessors.map((p) => ({
      사번: p.professorId,
      이름: p.name,
      이메일: p.email,
      학과: p.dept,
      "담당 강의": p.courses,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "교수 목록");
    XLSX.writeFile(workbook, "교수목록_내보내기.xlsx");
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  const resetForm = () => {
    setProfessorId("");
    setName("");
    setEmail("");
    setDept("");
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
          <h1 className="text-3xl font-bold text-zinc-900">
            교수 관리
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            전체 교수를 조회, 추가, 수정, 삭제할 수 있습니다
          </p>
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
              <DialogTitle className="text-lg font-semibold text-zinc-900">
                새 교수 추가
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 mt-1">
                교수 정보를 입력하세요
              </DialogDescription>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  사번
                </Label>
                <input
                  value={professorId}
                  onChange={(e) => setProfessorId(e.target.value)}
                  placeholder="P20240001"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  이름
                </Label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍교수"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  이메일
                </Label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hong.prof@university.ac.kr"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  학과
                </Label>
                <input
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  placeholder="컴퓨터공학과"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
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
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            strokeWidth={1.5}
          />
          <input
            placeholder="이름, 사번, 이메일, 학과로 검색..."
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
            {filteredProfessors.length}명
          </span>
        </div>
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  사번
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  이름
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  이메일
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  학과
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-center">
                  담당 강의
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-right">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessors.map((professor, index) => (
                <motion.tr
                  key={professor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-zinc-600 font-mono">
                    {professor.professorId}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {professor.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {professor.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {professor.dept}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                      {professor.courses}개
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex justify-end gap-1.5">
                      <Dialog
                        open={editingProfessor?.id === professor.id}
                        onOpenChange={(open) =>
                          !open && setEditingProfessor(null)
                        }
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
                            <DialogTitle className="text-lg font-semibold text-zinc-900">
                              교수 정보 수정
                            </DialogTitle>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                사번
                              </Label>
                              <input
                                value={professorId}
                                onChange={(e) => setProfessorId(e.target.value)}
                                disabled
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm cursor-not-allowed opacity-60"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                이름
                              </Label>
                              <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                이메일
                              </Label>
                              <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                학과
                              </Label>
                              <input
                                value={dept}
                                onChange={(e) => setDept(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <button
                              onClick={handleUpdate}
                              className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2"
                            >
                              수정하기
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <button
                        onClick={() => handleDelete(professor.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredProfessors.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-zinc-400"
                  >
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
              key={professor.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl border border-zinc-200 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">
                    {professor.name}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {professor.professorId}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Dialog
                    open={editingProfessor?.id === professor.id}
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
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                          교수 정보 수정
                        </DialogTitle>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            사번
                          </Label>
                          <input
                            value={professorId}
                            onChange={(e) => setProfessorId(e.target.value)}
                            disabled
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm cursor-not-allowed opacity-60"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            이름
                          </Label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            이메일
                          </Label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            학과
                          </Label>
                          <input
                            value={dept}
                            onChange={(e) => setDept(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <button
                          onClick={handleUpdate}
                          className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2"
                        >
                          수정하기
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <button
                    onClick={() => handleDelete(professor.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500 truncate">
                {professor.email}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{professor.dept}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                  {professor.courses}개 강의
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
      </motion.div>
    </div>
  );
}
