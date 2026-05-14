import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Plus, Search, Edit, Trash2, Users, Clock, MapPin, Loader2, UserPlus, UserMinus } from "lucide-react";
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
import { api } from "../../api/client";
import { CURRENT_YEAR, CURRENT_SEMESTER_NUM } from "../../constants/semester";

const DAY_KO: Record<string, string> = {
  MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수", THURSDAY: "목",
  FRIDAY: "금", SATURDAY: "토", SUNDAY: "일",
};
const formatDay = (day: string) =>
  day.split(",").map(d => DAY_KO[d.trim()] || d.trim()).join(",");

interface Lecture {
  lectureId: number;
  lectureCode: string;
  lectureName: string;
  ProfessorName?: string;
  room?: string;
  classroom?: string;
  lectureDay: string;
  startTime: string;
  endTime: string;
  year: number;
  semester: string;
  division: string;
  studentCount?: number;
}

interface Student {
  studentId: number;
  studentNum: string;
  studentName: string;
  department: string;
}

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

// 시간/분 옵션
const hourOptions = Array.from({ length: 15 }, (_, i) => String(i + 8).padStart(2, "0")); // 08~22
const minuteOptions = ["00", "10", "20", "30", "40", "50"];

export default function AdminCourseManagement() {
  const [courses, setCourses] = useState<Lecture[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // 수강생 관리 상태
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Lecture | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [inputStudentNum, setInputStudentNum] = useState("");
  const [allStudents, setAllStudents] = useState<{ userNum: string; userName: string }[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  // 임시 추가/삭제 목록
  const [pendingAdds, setPendingAdds] = useState<{ studentNum: string; studentName: string }[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]); // studentNum 배열
  const [originalStudents, setOriginalStudents] = useState<Student[]>([]);

  // 교수 검색 상태
  const [professorList, setProfessorList] = useState<{ userNum: string; userName: string }[]>([]);
  const [profSearch, setProfSearch] = useState("");
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const profDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profDropdownRef.current && !profDropdownRef.current.contains(e.target as Node)) {
        setShowProfDropdown(false);
      }
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form States
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [profNum, setProfNum] = useState(""); // 교수 사번 (실제 전송값)
  const [profDisplayName, setProfDisplayName] = useState(""); // 화면 표시용 이름
  const [day, setDay] = useState("월요일");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [room, setRoom] = useState("");
  const [division, setDivision] = useState("");

  const fetchLectures = useCallback(async () => {
    setLoading(true);
    try {
      const profRes = await api<any>("/api/admin/professors?size=100", { method: "GET" });
      const professors = profRes.data?.content || profRes.data?.data || profRes.data || [];

      if (professors.length === 0) {
        setCourses([]);
        return;
      }

      const lecturePromises = professors.map((prof: any) =>
        api(`/api/admin/lectures/${prof.userNum}?year=${CURRENT_YEAR}&semester=${CURRENT_SEMESTER_NUM}`, { method: "GET" }).catch(() => null)
      );

      const responses = await Promise.all(lecturePromises);
      let allLectures: Lecture[] = [];
      responses.forEach((res: any) => {
        const data = res?.data;
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        if (Array.isArray(list)) allLectures = [...allLectures, ...list];
      });

      // 각 강의별 수강생 수 조회
      const countPromises = allLectures.map((lec) =>
        api<any>(`/api/admin/lectures/${lec.lectureId}/get/students?size=1`, { method: "GET" })
          .then((res) => res.data?.data?.totalElements ?? res.data?.totalElements ?? 0)
          .catch(() => 0)
      );
      const counts = await Promise.all(countPromises);
      allLectures = allLectures.map((lec, i) => ({ ...lec, studentCount: counts[i] }));

      setCourses(allLectures);
    } catch (e: any) {
      toast.error("강의 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // 교수 목록 조회
  const fetchProfessors = useCallback(async () => {
    try {
      const res = await api<any>("/api/admin/professors?size=100", { method: "GET" });
      const data = res.data?.content || res.data?.data || res.data || [];
      setProfessorList(Array.isArray(data) ? data.map((p: any) => ({ userNum: p.userNum, userName: p.userName })) : []);
    } catch { setProfessorList([]); toast.error("교수 목록을 불러오지 못했습니다."); }
  }, []);

  useEffect(() => { fetchProfessors(); }, [fetchProfessors]);

  // 전체 학생 목록 조회 (수강생 추가 드롭다운용)
  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await api<any>("/api/admin/students?size=1000", { method: "GET" });
      const data = res.data?.content || res.data?.data || res.data || [];
      setAllStudents(Array.isArray(data) ? data.map((s: any) => ({ userNum: s.userNum, userName: s.userName })) : []);
    } catch { setAllStudents([]); toast.error("학생 목록을 불러오지 못했습니다."); }
  }, []);

  useEffect(() => { fetchAllStudents(); }, [fetchAllStudents]);

  // 수강생 목록 조회
  const fetchStudents = async (lectureId: number) => {
    setStudentLoading(true);
    try {
      const res = await api<any>(`/api/admin/lectures/${lectureId}/get/students?size=100`, { method: "GET" });
      const data = res.data?.data?.content || res.data?.content || [];
      setStudents(data);
      setOriginalStudents(data);
      setPendingAdds([]);
      setPendingDeletes([]);
    } catch (e: any) {
      setStudents([]);
      setOriginalStudents([]);
      toast.error("학생 목록을 불러오지 못했습니다.");
    } finally {
      setStudentLoading(false);
    }
  };

  // 수강생 추가 (임시)
  const handleAddStudent = () => {
    if (!selectedCourse || !inputStudentNum) {
      toast.error("학생을 선택해주세요.");
      return;
    }
    // 이미 기존 목록에 있는지 확인
    if (originalStudents.some(s => s.studentNum === inputStudentNum) && !pendingDeletes.includes(inputStudentNum)) {
      toast.error("이미 등록된 학생입니다.");
      return;
    }
    // 이미 추가 대기 중인지 확인
    if (pendingAdds.some(s => s.studentNum === inputStudentNum)) {
      toast.error("이미 추가 대기 중인 학생입니다.");
      return;
    }
    // 삭제 대기 중이었다면 삭제 취소
    if (pendingDeletes.includes(inputStudentNum)) {
      setPendingDeletes(prev => prev.filter(n => n !== inputStudentNum));
    } else {
      setPendingAdds(prev => [...prev, { studentNum: inputStudentNum, studentName: selectedStudentName }]);
    }
    setInputStudentNum(""); setSelectedStudentName(""); setStudentSearch("");
  };

  // 수강생 삭제 (임시)
  const handleDeleteStudent = (studentNum: string) => {
    if (!studentNum) return;
    // 추가 대기 중이었다면 그냥 제거
    if (pendingAdds.some(s => s.studentNum === studentNum)) {
      setPendingAdds(prev => prev.filter(s => s.studentNum !== studentNum));
    } else {
      setPendingDeletes(prev => [...prev, studentNum]);
    }
  };

  // 저장 (API 호출)
  const handleSaveStudents = async () => {
    if (!selectedCourse || submitting) return;
    setSubmitting(true);
    try {
      // 추가 API 호출
      for (const s of pendingAdds) {
        await api(`/api/admin/lectures/${selectedCourse.lectureId}/add/students`, {
          method: "POST",
          body: JSON.stringify({ studentNum: s.studentNum }),
        });
      }
      // 삭제 API 호출
      for (const studentNum of pendingDeletes) {
        await api(`/api/admin/lectures/${selectedCourse.lectureId}/students/${studentNum}/delete`, {
          method: "DELETE",
        });
      }
      toast.success("저장되었습니다.");
      fetchStudents(selectedCourse.lectureId);
      fetchLectures();
    } catch (e: any) {
      toast.error(e.message || "수강생 변경 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 표시용 학생 목록 (원본 - 삭제 + 추가)
  const displayStudents = [
    ...originalStudents.filter(s => !pendingDeletes.includes(s.studentNum)),
    ...pendingAdds.map(s => ({ studentId: 0, studentNum: s.studentNum, studentName: s.studentName, department: "" })),
  ];

  const resetForm = () => {
    setCode(""); setName(""); setProfNum(""); setProfDisplayName(""); setProfSearch("");
    setDay("월요일"); setStart(""); setEnd("");
    setRoom(""); setDivision(""); setShowProfDropdown(false);
  };

  const handleAdd = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api("/api/admin/lectures", {
        method: "POST",
        body: JSON.stringify({
          lectureName: name, lectureCode: code, professorNum: profNum,
          startTime: start, endTime: end, room: room,
          year: CURRENT_YEAR, semester: CURRENT_SEMESTER_NUM, lectureDay: day, division: division
        }),
      });
      toast.success("등록되었습니다.");
      setIsAddDialogOpen(false);
      resetForm();
      fetchLectures();
    } catch (e: any) {
      toast.error("강의 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInit = (course: Lecture) => {
    setEditingCourse(course);
    setCode(course.lectureCode || "");
    setName(course.lectureName || "");
    // 기존 교수 정보 세팅 - ProfessorName은 표시용, professorNum 찾기
    const matchedProf = professorList.find(p => p.userName === course.ProfessorName);
    setProfNum(matchedProf?.userNum || "");
    setProfDisplayName(course.ProfessorName || "");
    setProfSearch("");
    setRoom(course.room || course.classroom || "");
    setDay(course.lectureDay || "월요일");
    setStart(course.startTime || "");
    setEnd(course.endTime || "");
    setDivision(course.division || "");
  };

  const handleUpdate = async () => {
    if (!editingCourse || submitting) return;
    setSubmitting(true);
    try {
      await api(`/api/admin/lectures/${editingCourse.lectureId}/edit`, {
        method: "PATCH",
        body: JSON.stringify({
          lectureName: name, lectureCode: code, professorNum: profNum,
          startTime: start, endTime: end, room: room,
          year: CURRENT_YEAR, semester: CURRENT_SEMESTER_NUM, lectureDay: day, division: division
        }),
      });
      toast.success("수정되었습니다.");
      setEditingCourse(null);
      fetchLectures();
    } catch (e: any) {
      toast.error("강의 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null || submitting) return;
    setSubmitting(true);
    try {
      await api(`/api/admin/lectures/${deleteTarget}/delete`, { method: "DELETE" });
      toast.success("삭제되었습니다.");
      fetchLectures();
    } catch (e: any) {
      toast.error("강의 삭제에 실패했습니다.");
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.lectureName?.toLowerCase().includes(q) ||
      c.lectureCode?.toLowerCase().includes(q) ||
      (c.ProfessorName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6 px-4 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">강의 관리</h1>
          <p className="text-sm text-zinc-400 mt-1">전체 강의 정보를 조회하고 관리할 수 있습니다.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <button className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> 강의 추가
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>새 강의 추가</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>강의 코드</Label><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="CS301" /></div>
                <div className="space-y-1.5"><Label>분반</Label><input value={division} onChange={(e) => setDivision(e.target.value)} className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="01" /></div>
              </div>
              <div className="space-y-1.5"><Label>강의명</Label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative" ref={profDropdownRef}>
                  <Label>담당 교수</Label>
                  <input
                    value={profDisplayName ? `${profDisplayName} (${profNum})` : profSearch}
                    onChange={(e) => { setProfSearch(e.target.value); setProfNum(""); setProfDisplayName(""); setShowProfDropdown(true); }}
                    onFocus={() => setShowProfDropdown(true)}
                    className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="이름 또는 사번 검색"
                  />
                  {profDisplayName && <button type="button" onClick={() => { setProfNum(""); setProfDisplayName(""); setProfSearch(""); }} className="absolute right-3 top-[38px] text-zinc-400 hover:text-zinc-600 text-xs">✕</button>}
                  {showProfDropdown && !profDisplayName && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {professorList.filter(p => {
                        const q = profSearch.toLowerCase();
                        return !q || p.userName.toLowerCase().includes(q) || p.userNum.toLowerCase().includes(q);
                      }).map(p => (
                        <button key={p.userNum} type="button" onClick={() => { setProfNum(p.userNum); setProfDisplayName(p.userName); setProfSearch(""); setShowProfDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors flex justify-between">
                          <span className="font-medium">{p.userName}</span>
                          <span className="text-zinc-400 text-xs">{p.userNum}</span>
                        </button>
                      ))}
                      {professorList.filter(p => { const q = profSearch.toLowerCase(); return !q || p.userName.toLowerCase().includes(q) || p.userNum.toLowerCase().includes(q); }).length === 0 && (
                        <div className="px-4 py-3 text-sm text-zinc-400 text-center">검색 결과 없음</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5"><Label>강의실</Label><input value={room} onChange={(e) => setRoom(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none" /></div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl space-y-3">
                <div className="space-y-1.5">
                  <Label>강의 요일</Label>
                  <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none">
                    {["월요일", "화요일", "수요일", "목요일", "금요일"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>시작 시간</Label>
                    <div className="flex gap-1.5">
                      <select value={start.split(":")[0] || ""} onChange={(e) => setStart(`${e.target.value}:${start.split(":")[1] || "00"}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">시</option>
                        {hourOptions.map(h => <option key={h} value={h}>{h}시</option>)}
                      </select>
                      <select value={start.split(":")[1] || ""} onChange={(e) => setStart(`${start.split(":")[0] || "08"}:${e.target.value}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">분</option>
                        {minuteOptions.map(m => <option key={m} value={m}>{m}분</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>종료 시간</Label>
                    <div className="flex gap-1.5">
                      <select value={end.split(":")[0] || ""} onChange={(e) => setEnd(`${e.target.value}:${end.split(":")[1] || "00"}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">시</option>
                        {hourOptions.map(h => <option key={h} value={h}>{h}시</option>)}
                      </select>
                      <select value={end.split(":")[1] || ""} onChange={(e) => setEnd(`${end.split(":")[0] || "08"}:${e.target.value}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">분</option>
                        {minuteOptions.map(m => <option key={m} value={m}>{m}분</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleAdd} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "처리 중..." : "등록하기"}</button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.05 }} className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input placeholder="강의명, 코드, 교수명으로 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-zinc-200 p-3 pl-10 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all" />
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900">강의 목록</h2>
          </div>
          <span className="text-xs font-medium bg-zinc-50 text-zinc-500 px-2.5 py-1 rounded-lg">{filteredCourses.length}건</span>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/50">
              <tr className="text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                <th className="px-6 py-3">강의코드</th>
                <th className="px-6 py-3">강의명</th>
                <th className="px-6 py-3">담당교수</th>
                <th className="px-6 py-3">시간</th>
                <th className="px-6 py-3">강의실</th>
                <th className="px-6 py-3">수강인원</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-300"/></td></tr>
              ) : filteredCourses.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-sm text-zinc-400">검색 결과가 없습니다</td></tr>
              ) : filteredCourses.map((course, index) => (
                <motion.tr key={course.lectureId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 text-primary-dark uppercase">
                      {course.lectureCode}-{course.division}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">{course.lectureName}</td>
                  <td className="px-6 py-4 text-zinc-600">{course.ProfessorName}</td>
                  <td className="px-6 py-4 text-zinc-600">
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-400"/> {formatDay(course.lectureDay)} {course.startTime}-{course.endTime}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-400"/> {course.room || course.classroom}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">
                    <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-zinc-400"/> {course.studentCount || 0}명</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setSelectedCourse(course); setIsStudentModalOpen(true); setShowStudentDropdown(false); setInputStudentNum(""); setSelectedStudentName(""); setStudentSearch(""); fetchStudents(course.lectureId); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-primary/10 hover:text-primary transition-colors"><Users className="w-4 h-4" /></button>
                      <button onClick={() => handleEditInit(course)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => setDeleteTarget(course.lectureId)} disabled={submitting} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-zinc-100">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-300"/></div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-400">검색 결과가 없습니다</div>
          ) : filteredCourses.map((course) => (
            <div key={course.lectureId} className="p-5 space-y-4 hover:bg-zinc-50/50 transition-colors text-left">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary-dark uppercase">
                    {course.lectureCode}-{course.division}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 truncate">{course.lectureName}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{course.ProfessorName} 교수</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedCourse(course); setIsStudentModalOpen(true); setShowStudentDropdown(false); setInputStudentNum(""); setSelectedStudentName(""); setStudentSearch(""); fetchStudents(course.lectureId); }} className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-50 text-zinc-500"><Users className="w-4 h-4" /></button>
                  <button onClick={() => handleEditInit(course)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-50 text-zinc-500"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(course.lectureId)} disabled={submitting} className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 px-4 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-1.5 text-xs text-zinc-600"><Clock className="w-3.5 h-3.5 text-zinc-400" /><span className="truncate">{formatDay(course.lectureDay)} {course.startTime}</span></div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600"><MapPin className="w-3.5 h-3.5 text-zinc-400" /><span className="truncate">{course.room || course.classroom}</span></div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600"><Users className="w-3.5 h-3.5 text-zinc-400" /><span>수강생 {course.studentCount || 0}명</span></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 수강생 관리 모달 */}
      <Dialog open={isStudentModalOpen} onOpenChange={(open) => { if (!open) { setPendingAdds([]); setPendingDeletes([]); setIsStudentModalOpen(false); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl text-left" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="p-6 border-b border-zinc-100 bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Users className="w-5 h-5 text-primary" /> 수강생 명단 관리
              </DialogTitle>
              <DialogDescription>
                <span className="font-bold text-zinc-900">[{selectedCourse?.lectureName}]</span> 강의 명단입니다.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 bg-zinc-50/50 border-b flex gap-2">
            <div className="flex-1 relative" ref={studentDropdownRef}>
              <input
                type="text"
                placeholder="이름 또는 학번으로 검색"
                value={selectedStudentName ? `${selectedStudentName} (${inputStudentNum})` : studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setInputStudentNum(""); setSelectedStudentName(""); setShowStudentDropdown(true); }}
                onClick={() => setShowStudentDropdown(true)}
                className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              />
              {selectedStudentName && <button type="button" onClick={() => { setInputStudentNum(""); setSelectedStudentName(""); setStudentSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs">✕</button>}
              {showStudentDropdown && !selectedStudentName && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {allStudents.filter(s => {
                    const q = studentSearch.toLowerCase();
                    return !q || s.userName.toLowerCase().includes(q) || s.userNum.toLowerCase().includes(q);
                  }).slice(0, 50).map(s => (
                    <button key={s.userNum} type="button" onClick={() => { setInputStudentNum(s.userNum); setSelectedStudentName(s.userName); setStudentSearch(""); setShowStudentDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors flex justify-between">
                      <span className="font-medium">{s.userName}</span>
                      <span className="text-zinc-400 text-xs">{s.userNum}</span>
                    </button>
                  ))}
                  {allStudents.filter(s => { const q = studentSearch.toLowerCase(); return !q || s.userName.toLowerCase().includes(q) || s.userNum.toLowerCase().includes(q); }).length === 0 && (
                    <div className="px-4 py-3 text-sm text-zinc-400 text-center">검색 결과 없음</div>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleAddStudent} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 flex items-center gap-1.5 shrink-0"><UserPlus className="w-4 h-4" /> 추가</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {studentLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-zinc-300" /></div>
            ) : (
              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-500">
                    <tr><th className="px-6 py-3 font-semibold text-xs">학번</th><th className="px-6 py-3 font-semibold text-xs">이름</th><th className="px-6 py-3 font-semibold text-right pr-10 text-xs">관리</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {displayStudents.length > 0 ? displayStudents.map((std) => (
                      <tr key={std.studentNum} className={`hover:bg-zinc-50/30 transition-colors ${pendingAdds.some(s => s.studentNum === std.studentNum) ? "bg-green-50/50" : ""}`}>
                        <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{std.studentNum}{pendingAdds.some(s => s.studentNum === std.studentNum) && <span className="ml-2 text-green-500 text-[10px] font-bold">NEW</span>}</td>
                        <td className="px-6 py-4 font-bold text-zinc-900">{std.studentName}</td>
                        <td className="flex justify-end px-6 py-4 text-right pr-10">
                          <button onClick={() => handleDeleteStudent(std.studentNum)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (<tr><td colSpan={3} className="py-20 text-center text-zinc-400 text-sm">등록된 수강생이 없습니다.</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-4 bg-zinc-50 border-t flex justify-end gap-2">
            <button onClick={handleSaveStudents} disabled={submitting} className="px-5 py-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "처리 중..." : "저장"}</button>
            <button onClick={async () => { await handleSaveStudents(); setIsStudentModalOpen(false); }} disabled={submitting} className="px-5 py-2 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "처리 중..." : "완료"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent className="sm:max-w-md text-left">
            <DialogHeader><DialogTitle>강의 정보 수정</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>강의 코드</Label><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none" /></div>
                <div className="space-y-1.5"><Label>분반</Label><input value={division} onChange={(e) => setDivision(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none" /></div>
              </div>
              <div className="space-y-1.5"><Label>강의명</Label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative" ref={profDropdownRef}>
                  <Label>담당 교수</Label>
                  <input
                    value={profDisplayName ? `${profDisplayName} (${profNum})` : profSearch}
                    onChange={(e) => { setProfSearch(e.target.value); setProfNum(""); setProfDisplayName(""); setShowProfDropdown(true); }}
                    onFocus={() => setShowProfDropdown(true)}
                    className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="이름 또는 사번 검색"
                  />
                  {profDisplayName && <button type="button" onClick={() => { setProfNum(""); setProfDisplayName(""); setProfSearch(""); }} className="absolute right-3 top-[38px] text-zinc-400 hover:text-zinc-600 text-xs">✕</button>}
                  {showProfDropdown && !profDisplayName && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {professorList.filter(p => {
                        const q = profSearch.toLowerCase();
                        return !q || p.userName.toLowerCase().includes(q) || p.userNum.toLowerCase().includes(q);
                      }).map(p => (
                        <button key={p.userNum} type="button" onClick={() => { setProfNum(p.userNum); setProfDisplayName(p.userName); setProfSearch(""); setShowProfDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors flex justify-between">
                          <span className="font-medium">{p.userName}</span>
                          <span className="text-zinc-400 text-xs">{p.userNum}</span>
                        </button>
                      ))}
                      {professorList.filter(p => { const q = profSearch.toLowerCase(); return !q || p.userName.toLowerCase().includes(q) || p.userNum.toLowerCase().includes(q); }).length === 0 && (
                        <div className="px-4 py-3 text-sm text-zinc-400 text-center">검색 결과 없음</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5"><Label>강의실</Label><input value={room} onChange={(e) => setRoom(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none" /></div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl space-y-3">
                <div className="space-y-1.5">
                  <Label>강의 요일</Label>
                  <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none">
                    {["월요일", "화요일", "수요일", "목요일", "금요일"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>시작 시간</Label>
                    <div className="flex gap-1.5">
                      <select value={start.split(":")[0] || ""} onChange={(e) => setStart(`${e.target.value}:${start.split(":")[1] || "00"}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">시</option>
                        {hourOptions.map(h => <option key={h} value={h}>{h}시</option>)}
                      </select>
                      <select value={start.split(":")[1] || ""} onChange={(e) => setStart(`${start.split(":")[0] || "08"}:${e.target.value}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">분</option>
                        {minuteOptions.map(m => <option key={m} value={m}>{m}분</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>종료 시간</Label>
                    <div className="flex gap-1.5">
                      <select value={end.split(":")[0] || ""} onChange={(e) => setEnd(`${e.target.value}:${end.split(":")[1] || "00"}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">시</option>
                        {hourOptions.map(h => <option key={h} value={h}>{h}시</option>)}
                      </select>
                      <select value={end.split(":")[1] || ""} onChange={(e) => setEnd(`${end.split(":")[0] || "08"}:${e.target.value}`)} className="flex-1 border rounded-lg p-2.5 text-sm bg-white outline-none">
                        <option value="">분</option>
                        {minuteOptions.map(m => <option key={m} value={m}>{m}분</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleUpdate} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "처리 중..." : "수정 완료"}</button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] sm:max-w-sm">
          <div className="p-6 text-center space-y-4">
            <DialogTitle className="text-lg font-semibold text-zinc-900">강의 삭제</DialogTitle>
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