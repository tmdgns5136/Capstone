import { Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { LogOut, Bell, Menu, X, User as UserIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { NotificationBell } from "../NotificationBell";
import { Logo } from "../Logo";
import { useAuth } from "../../hooks/useAuth";
import { logout as apiLogout } from "../../api/auth";
import ThemeToggle from "../ThemeToggle";

interface NavItem {
  name: string;
  href: string;
}

interface TopNavProps {
  role: "student" | "professor" | "admin";
  navItems: NavItem[];
  userName: string;
  userDepartment?: string;
  profileImage?: string;
}

export default function TopNav({ role, navItems, userName, userDepartment, profileImage }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // 서버 에러여도 로컬 로그아웃 처리
    }
    logout();
    navigate("/login");
  };

  const isActive = (href: string) => {
    if (href === `/${role}`) {
      return location.pathname === `/${role}`;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link to={`/${role}`}>
                <Logo size="md" />
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative px-3 py-4 text-sm font-medium transition-colors"
                  >
                    <span className={isActive(item.href) ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}>
                      {item.name}
                    </span>
                    {isActive(item.href) && (
                      <motion.div
                        layoutId={`${role}-nav-indicator`}
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span>로그아웃</span>
              </button>
              <NotificationBell role={role} />
              <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={userName}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                    width={36}
                    height={36}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-900 leading-tight">{userName}</p>
                  {userDepartment && (
                    <p className="text-xs text-zinc-500 leading-tight">{userDepartment}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: Theme + Notification + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <NotificationBell role={role} />
              <button
                className="w-9 h-9 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-14 left-0 right-0 z-50 bg-white border-b border-zinc-200 shadow-lg"
            >
              <nav className="flex flex-col p-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-zinc-900 bg-zinc-50"
                        : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-zinc-100 mt-2 pt-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={userName}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                          width={36}
                          height={36}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{userName}</p>
                        {userDepartment && (
                          <p className="text-xs text-zinc-500">{userDepartment}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-primary hover:text-primary-hover font-medium"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
