import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Logo } from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { login as apiLogin } from "../api/auth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const savedId = localStorage.getItem("savedLoginId");
  const [loginId, setLoginId] = useState(savedId || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveId, setSaveId] = useState(!!savedId);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiLogin(loginId, password);
      const { role, userName, accessToken, refreshToken } = res.data;
      if (saveId) {
        localStorage.setItem("savedLoginId", loginId);
      } else {
        localStorage.removeItem("savedLoginId");
      }

      login(role, userName, accessToken, refreshToken);

      const mappedRole = role.toUpperCase().includes("STUDENT")
        ? "student"
        : role.toUpperCase().includes("PROFESSOR")
          ? "professor"
          : "admin";
      navigate(`/${mappedRole}`);
    } catch (err: any) {
      toast.error(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#09090b] flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-14">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Support</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">System Status</a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Center Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full max-w-[420px] py-10"
        >
          <h1 className="text-3xl font-bold text-zinc-900 mb-8">로그인</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* ID Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">ID</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  placeholder="학번 또는 사번을 입력해주세요."
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl py-3.5 pl-12 pr-12 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={saveId}
                  onChange={(e) => setSaveId(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center transition-all peer-checked:bg-zinc-900 peer-checked:border-zinc-900">
                  {saveId && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-zinc-600 select-none">아이디 저장</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center transition-all peer-checked:bg-zinc-900 peer-checked:border-zinc-900">
                  {stayLoggedIn && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-zinc-600 select-none">로그인 상태 유지</span>
              </label>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-5 h-5 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full"
                />
              ) : (
                <>
                  로그인
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </motion.button>
          </form>

          {/* Links */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
            >
              회원가입
            </button>
            <button
              onClick={() => navigate("/password-reset")}
              className="text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
            >
              비밀번호 찾기
            </button>
          </div>

          {/* ASSAS Divider */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs font-bold text-zinc-400 tracking-widest">ASaaS</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-600">Privacy Policy</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-600">Terms of Service</a>
          </div>
          <p className="text-xs text-zinc-400">Team 천천히, 꾸준히</p>
          <p className="text-xs text-zinc-400">&copy; 2024 FaceAttend Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
