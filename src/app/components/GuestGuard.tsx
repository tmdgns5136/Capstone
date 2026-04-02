import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface GuestGuardProps {
  children: React.ReactNode;
}

/** 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하면 대시보드로 리다이렉트 */
export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <>{children}</>;
}
