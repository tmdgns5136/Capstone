import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import AuthGuard from "./components/AuthGuard";
import GuestGuard from "./components/GuestGuard";

const Login = lazy(() => import("./pages/Login"));
const SignupSelect = lazy(() => import("./pages/SignupSelect"));
const StudentSignup = lazy(() => import("./pages/student/StudentSignup"));
const ProfessorSignup = lazy(() => import("./pages/professor/ProfessorSignup"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const ProfessorDashboard = lazy(() => import("./pages/professor/ProfessorDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function L({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, element: <GuestGuard><L><Login /></L></GuestGuard> },
      { path: "login", element: <GuestGuard><L><Login /></L></GuestGuard> },
      { path: "password-reset", element: <GuestGuard><L><PasswordReset /></L></GuestGuard> },
      { path: "signup", element: <GuestGuard><L><SignupSelect /></L></GuestGuard> },
      { path: "signup/student", element: <GuestGuard><L><StudentSignup /></L></GuestGuard> },
      { path: "signup/professor", element: <GuestGuard><L><ProfessorSignup /></L></GuestGuard> },
      { path: "student/*", element: <AuthGuard allowedRole="student"><L><StudentDashboard /></L></AuthGuard> },
      { path: "professor/*", element: <AuthGuard allowedRole="professor"><L><ProfessorDashboard /></L></AuthGuard> },
      { path: "admin/*", element: <AuthGuard allowedRole="admin"><L><AdminDashboard /></L></AuthGuard> },
      { path: "*", element: <L><NotFound /></L> },
    ],
  },
]);
