import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router";
import StudentHome from "./StudentHome";
import StudentTimetable from "./StudentTimetable";
import StudentCourses from "./StudentCourses";
import StudentStats from "./StudentStats";
import StudentCourseStats from "./StudentCourseStats";
import StudentProfile from "./StudentProfile";
import StudentAbsenceRequest from "./StudentAbsenceRequest";
import NotificationsPage from "../shared/NotificationsPage";
import TopNav from "../../components/layout/TopNav";
import Footer from "../../components/layout/Footer";
import { getProfile } from "../../api/mypage";

const navItems = [
  { name: "홈", href: "/student" },
  { name: "내 강의", href: "/student/courses" },
  { name: "출석 현황", href: "/student/stats" },
  { name: "공결 신청", href: "/student/absence-request" },
  { name: "마이페이지", href: "/student/profile" },
];

export default function StudentDashboard() {
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState<string | undefined>();

  useEffect(() => {
    getProfile()
      .then((res) => {
        const d = res.data;
        setUserName(d.userName);
        const center = d.profileImages?.find((img) => img.orientation === "CENTER");
        if (center?.url) setProfileImage(center.url);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-[#09090b]">
      <TopNav
        role="student"
        navItems={navItems}
        userName={userName || "학생"}
        userDepartment="컴퓨터과학전공"
        profileImage={profileImage}
      />
      <main className="flex-1 pt-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route index element={<StudentHome />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="stats" element={<StudentStats />} />
            <Route path="stats/:courseId" element={<StudentCourseStats />} />
            <Route path="absence-request" element={<StudentAbsenceRequest />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="notifications" element={<NotificationsPage role="student" />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
