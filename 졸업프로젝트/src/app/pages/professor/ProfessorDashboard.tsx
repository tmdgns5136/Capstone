import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import ProfessorHome from "./ProfessorHome";
import ProfessorClassControl from "./ProfessorClassControl";
import ProfessorAbsenceManagement from "./ProfessorAbsenceManagement";
import ProfessorAppealManagement from "./ProfessorAppealManagement";
import ProfessorMonitoring from "./ProfessorMonitoring";
import ProfessorCourses from "./ProfessorCourses";
import ProfessorProfile from "./ProfessorProfile";
import NotificationsPage from "../shared/NotificationsPage";
import TopNav from "../../components/layout/TopNav";
import Footer from "../../components/layout/Footer";
import { ClassSimulatorProvider } from "../../hooks/useClassSimulator";

const navItems = [
  { name: "홈", href: "/professor" },
  { name: "내 강의", href: "/professor/courses" },
  { name: "수업 제어", href: "/professor/class-control" },
  { name: "이의신청 관리", href: "/professor/appeal-management" },
  { name: "공결 관리", href: "/professor/absence-management" },
  { name: "출결 조회", href: "/professor/monitoring" },
  { name: "마이페이지", href: "/professor/profile" },
];

export default function ProfessorDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser({ user_metadata: { name: "임정택 교수" }, email: "professor@univ.ac.kr", department: "컴퓨터과학과" });
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-[#09090b]">
      <TopNav
        role="professor"
        navItems={navItems}
        userName={user?.user_metadata?.name || "교수"}
        userDepartment={user?.department || ""}
      />
      <main className="flex-1 pt-14">
        <ClassSimulatorProvider>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              <Route index element={<ProfessorHome />} />
              <Route path="class-control" element={<ProfessorClassControl />} />
              <Route path="appeal-management" element={<ProfessorAppealManagement />} />
              <Route path="absence-management" element={<ProfessorAbsenceManagement />} />
              <Route path="monitoring" element={<ProfessorMonitoring />} />
              <Route path="courses" element={<ProfessorCourses />} />
              <Route path="profile" element={<ProfessorProfile />} />
              <Route path="notifications" element={<NotificationsPage role="professor" />} />
            </Routes>
          </div>
        </ClassSimulatorProvider>
      </main>
      <Footer />
    </div>
  );
}
