import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { User, Hash, Check, Mail, Eye, EyeOff, Phone, BookOpen } from "lucide-react";
import { OtpInput } from "../../components/OtpInput";
import { toast } from "sonner";
import { sendEmailCode, verifyEmailCode, signupProfessor } from "../../api/auth";
import { formatPhone } from "../../utils/format";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export default function ProfessorSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [major, setMajor] = useState(""); // ✅ 전공 상태 추가
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(180);
    setExpired(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearTimer(); setExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleProfessorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setProfessorId(value.slice(0, 6));
  };

  const sendVerificationCode = async () => {
    if (!email.includes("@")) {
      toast.error("잘못된 이메일 형식입니다");
      return;
    }

    setLoading(true);
    try {
      await sendEmailCode(email);
      setSentCode("sent");
      setVerificationCode("");
      startTimer();
      toast.success("인증번호가 이메일로 전송되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "인증번호 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (expired) {
      toast.error("인증번호가 만료되었습니다. 재전송해 주세요.");
      return;
    }
    try {
      await verifyEmailCode(email, verificationCode);
      clearTimer();
      setIsEmailVerified(true);
      toast.success("인증이 완료되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "인증번호가 일치하지 않습니다");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(professorId)) {
      toast.error("사번은 6자리 숫자여야 합니다.");
      return;
    }
    if (!major) {
      toast.error("전공을 입력해주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      toast.error("전화번호를 올바르게 입력해주세요.");
      return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
      toast.error("비밀번호는 영문+숫자 포함 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isEmailVerified) {
      toast.error("이메일 인증이 필요합니다");
      return;
    }

    setLoading(true);
    try {
      // ✅ api/auth.ts의 signupProfessor 함수에도 major를 받을 수 있도록 파라미터를 추가해 주셔야 합니다!
      await signupProfessor(professorId, name, email, password, phone, major);
      toast.success("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all placeholder:text-zinc-300";
  const inputErrorClass = "w-full rounded-xl border border-rose-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all placeholder:text-zinc-300";

  return (
    <div className="min-h-[100dvh] bg-[#F8FAF9] dark:bg-[#09090b] py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-start">

      <div className="max-w-xl w-full mx-auto mt-8">

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex items-center justify-between mb-5"
        >
          <span className="text-xs font-medium text-white bg-rose-500 px-3 py-1 rounded-full">
            교수 회원가입
          </span>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
            프로필 설정
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-400 px-5 sm:px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <h2 className="text-2xl font-bold tracking-tight text-white relative z-10">
                교수 정보 입력
              </h2>
              <p className="text-rose-100 text-sm mt-1 relative z-10">
                관리자 프로필을 생성합니다.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      <input
                        placeholder="김교수"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  {/* Professor ID */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">사번 (6자리 숫자)</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      <input
                        placeholder="123456"
                        value={professorId}
                        onChange={handleProfessorIdChange}
                        maxLength={6}
                        className={`${professorId.length > 0 && professorId.length !== 6 ? inputErrorClass : inputClass} pl-10`}
                        required
                      />
                    </div>
                    {professorId.length > 0 && professorId.length !== 6 && (
                      <p className="text-xs text-rose-500 mt-1">사번은 6자리 숫자여야 합니다.</p>
                    )}
                  </div>
                </div>

                {/* Phone & Major (전화번호와 전공을 한 줄에 배치) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">전화번호</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      <input
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        maxLength={13}
                        className={`${phone.length > 0 && phone.replace(/-/g, '').length < 10 ? inputErrorClass : inputClass} pl-10`}
                        required
                      />
                    </div>
                    {phone.length > 0 && phone.replace(/-/g, '').length < 10 && (
                      <p className="text-xs text-rose-500 mt-1">전화번호를 올바르게 입력해주세요.</p>
                    )}
                  </div>

                  {/* Major (전공) 추가 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">전공 (학과)</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      <input
                        type="text"
                        placeholder="컴퓨터과학과"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">학교 이메일</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                      <input
                        type="email"
                        placeholder="prof@univ.ac.kr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClass} pl-10 disabled:opacity-50 disabled:bg-zinc-50`}
                        required
                        disabled={isEmailVerified}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={loading || isEmailVerified}
                      className={`text-sm font-medium px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap ${
                        isEmailVerified
                          ? "bg-rose-50 text-rose-500 border border-rose-200"
                          : "bg-rose-500 text-white hover:bg-rose-600"
                      }`}
                    >
                      {isEmailVerified ? (
                        <span className="flex items-center gap-1.5"><Check className="w-4 h-4" strokeWidth={1.5} /> 인증됨</span>
                      ) : sentCode ? "인증번호 재전송" : "인증번호 전송"}
                    </button>
                  </div>
                </div>

                {/* Verification Code */}
                {sentCode && !isEmailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={spring}
                    className="bg-rose-50 border border-rose-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-rose-600">인증번호 입력</label>
                      <span className={`text-xs font-mono font-semibold ${expired ? "text-rose-500" : timeLeft <= 30 ? "text-amber-500" : "text-rose-500"}`}>
                        {expired ? "만료됨" : formatTime(timeLeft)}
                      </span>
                    </div>
                    <OtpInput value={verificationCode} onChange={setVerificationCode} disabled={expired} accentColor="rose" />
                    <div className="flex justify-center mt-3">
                      {!expired ? (
                        <button
                          type="button"
                          onClick={verifyCode}
                          className="bg-rose-500 text-white text-sm font-medium px-8 py-2.5 rounded-xl hover:bg-rose-600 transition-colors"
                        >
                          확인
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={sendVerificationCode}
                          disabled={loading}
                          className="bg-rose-500 text-white text-sm font-medium px-8 py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
                        >
                          재전송
                        </button>
                      )}
                    </div>
                    {expired && (
                      <p className="text-xs text-rose-500 text-center mt-1">인증번호가 만료되었습니다. 재전송해 주세요.</p>
                    )}
                  </motion.div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">비밀번호</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="최소 8자"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        className={`${inputClass} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">비밀번호 확인</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호 재입력"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        className={`${confirmPassword && password !== confirmPassword ? inputErrorClass : inputClass} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showConfirmPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-rose-500 mt-1">비밀번호가 일치하지 않습니다.</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-rose-500 text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
                  disabled={!isEmailVerified || loading}
                >
                  {loading ? "데이터 처리 중..." : "등록 완료"}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-zinc-400 hover:text-rose-500 transition-colors">
              가입 취소 및 로그인으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}