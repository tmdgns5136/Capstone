import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import AdminHome from "./AdminHome";
import AdminCourseManagement from "./AdminCourseManagement";
import AdminStudentManagement from "./AdminStudentManagement";
import AdminProfessorManagement from "./AdminProfessorManagement";
import AdminDeviceManagement from "./AdminDeviceManagement";
import AdminPhotoRequestManagement from "./AdminPhotoRequestManagement";
import NotificationsPage from "../shared/NotificationsPage";
import TopNav from "../../components/layout/TopNav";
import Footer from "../../components/layout/Footer";

const navItems = [
  { name: "시스템 개요", href: "/admin" },
  { name: "장비 관리", href: "/admin/devices" },
  { name: "강의 관리", href: "/admin/courses" },
  { name: "학생 관리", href: "/admin/students" },
  { name: "교수 관리", href: "/admin/professors" },
  { name: "사진 변경 요청", href: "/admin/photo-requests" },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser({ email: "admin@system.local" });
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-[#09090b]">
      <TopNav
        role="admin"
        navItems={navItems}
        userName="관리자"
        userDepartment="시스템 관리"
      />
      <main className="flex-1 pt-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="devices" element={<AdminDeviceManagement />} />
            <Route path="courses" element={<AdminCourseManagement />} />
            <Route path="students" element={<AdminStudentManagement />} />
            <Route path="professors" element={<AdminProfessorManagement />} />
            <Route path="photo-requests" element={<AdminPhotoRequestManagement />} />
            <Route path="notifications" element={<NotificationsPage role="admin" />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
