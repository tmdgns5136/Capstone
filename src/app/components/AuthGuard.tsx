import { Navigate } from "react-router";
import { useAuth, type Role } from "../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: Role;
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    // 로그인은 했지만 역할이 다르면 본인 대시보드로
    const dashboardPath = `/${role}`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}
