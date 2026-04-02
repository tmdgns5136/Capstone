import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Plus, Search, Edit, Trash2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";

const spring = { type: "spring", stiffness: 100, damping: 20 };

const coursesData = [
  {
    id: 1,
    code: "CS301",
    name: "데이터베이스",
    professor: "김교수",
    schedule: "월 09:00-10:30",
    room: "공학관 301",
    students: 45,
    semester: "2026-1",
  },
  {
    id: 2,
    code: "CS302",
    name: "알고리즘",
    professor: "이교수",
    schedule: "월 13:00-14:30",
    room: "공학관 405",
    students: 38,
    semester: "2026-1",
  },
  {
    id: 3,
    code: "CS401",
    name: "웹프로그래밍",
    professor: "박교수",
    schedule: "화 10:00-11:30",
    room: "IT관 201",
    students: 42,
    semester: "2026-1",
  },
];

export default function AdminCourseManagement() {
  const [courses, setCourses] = useState(coursesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<
    (typeof coursesData)[0] | null
  >(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [professor, setProfessor] = useState("");
  const [schedule, setSchedule] = useState("");
  const [room, setRoom] = useState("");
  const [semester, setSemester] = useState("2026-1");

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.professor.includes(searchQuery),
  );

  const handleAdd = () => {
    if (!code || !name || !professor || !schedule || !room) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }

    const newCourse = {
      id: courses.length + 1,
      code,
      name,
      professor,
      schedule,
      room,
      students: 0,
      semester,
    };

    setCourses([...courses, newCourse]);
    toast.success("강의가 추가되었습니다");
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (course: (typeof coursesData)[0]) => {
    setEditingCourse(course);
    setCode(course.code);
    setName(course.name);
    setProfessor(course.professor);
    setSchedule(course.schedule);
    setRoom(course.room);
    setSemester(course.semester);
  };

  const handleUpdate = () => {
    if (!editingCourse) return;

    setCourses(
      courses.map((c) =>
        c.id === editingCourse.id
          ? { ...c, code, name, professor, schedule, room, semester }
          : c,
      ),
    );
    toast.success("강의 정보가 수정되었습니다");
    resetForm();
    setEditingCourse(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setCourses(courses.filter((c) => c.id !== id));
      toast.success("강의가 삭제되었습니다");
    }
  };

  const resetForm = () => {
    setCode("");
    setName("");
    setProfessor("");
    setSchedule("");
    setRoom("");
    setSemester("2026-1");
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
            강의 관리
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            전체 강의를 조회, 추가, 수정, 삭제할 수 있습니다
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={1.5} /> 강의 추가
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
            <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
              <DialogTitle className="text-lg font-semibold text-zinc-900">
                새 강의 추가
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 mt-1">
                강의 정보를 입력하세요
              </DialogDescription>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  강의 코드
                </Label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CS301"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  강의명
                </Label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="데이터베이스"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  담당 교수
                </Label>
                <input
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  placeholder="김교수"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  시간
                </Label>
                <input
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="월 09:00-10:30"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  강의실
                </Label>
                <input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="공학관 301"
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">
                  학기
                </Label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="2026-1">2026학년도 1학기</option>
                  <option value="2025-2">2025학년도 2학기</option>
                </select>
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
            placeholder="강의명, 강의코드, 교수명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </motion.div>

      {/* Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-900">강의 목록</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-700">
            {filteredCourses.length}건
          </span>
        </div>
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  강의코드
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  강의명
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  담당교수
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  시간
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  강의실
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50">
                  수강인원
                </th>
                <th className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-50/50 text-right">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, index) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {course.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {course.professor}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {course.schedule}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {course.room}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <Users
                        className="w-4 h-4 text-zinc-400"
                        strokeWidth={1.5}
                      />
                      <span>{course.students}명</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex justify-end gap-1.5">
                      <Dialog
                        open={editingCourse?.id === course.id}
                        onOpenChange={(open) => !open && setEditingCourse(null)}
                      >
                        <DialogTrigger asChild>
                          <button
                            onClick={() => handleEdit(course)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
                          <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                            <DialogTitle className="text-lg font-semibold text-zinc-900">
                              강의 정보 수정
                            </DialogTitle>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                강의 코드
                              </Label>
                              <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                강의명
                              </Label>
                              <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                담당 교수
                              </Label>
                              <input
                                value={professor}
                                onChange={(e) => setProfessor(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                시간
                              </Label>
                              <input
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-zinc-700">
                                강의실
                              </Label>
                              <input
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
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
                        onClick={() => handleDelete(course.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl border border-zinc-200 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                      {course.code}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {course.name}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">
                    {course.professor} · {course.schedule} · {course.room}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                    <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{course.students}명</span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Dialog
                    open={editingCourse?.id === course.id}
                    onOpenChange={(open) => !open && setEditingCourse(null)}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => handleEdit(course)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-md">
                      <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                          강의 정보 수정
                        </DialogTitle>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            강의 코드
                          </Label>
                          <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            강의명
                          </Label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            담당 교수
                          </Label>
                          <input
                            value={professor}
                            onChange={(e) => setProfessor(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            시간
                          </Label>
                          <input
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-zinc-700">
                            강의실
                          </Label>
                          <input
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
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
                    onClick={() => handleDelete(course.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredCourses.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-400">
              검색 결과가 없습니다
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
