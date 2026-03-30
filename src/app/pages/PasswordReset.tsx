import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, ArrowLeft, ArrowRight, GraduationCap, Eye, EyeOff, CheckCircle2, ShieldCheck, CircleCheck } from "lucide-react";
import { OtpInput } from "../components/OtpInput";
import { toast } from "sonner";
import { useVerificationTimer } from "../hooks/useVerificationTimer";
import { sendEmailCode, verifyEmailCode, changePassword } from "../api/auth";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

type Step = 1 | 2 | 3 | 4;

export default function PasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useVerificationTimer();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendEmailCode(email);
      toast.success("인증번호가 이메일로 전송되었습니다.");
      setStep(2);
      setCode("");
      timer.start();
    } catch (err: any) {
      toast.error(err.message || "인증번호 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await sendEmailCode(email);
      toast.success("인증번호가 재전송되었습니다.");
      setCode("");
      timer.start();
    } catch (err: any) {
      toast.error(err.message || "재전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timer.expired) {
      toast.error("인증번호가 만료되었습니다. 재전송해 주세요.");
      return;
    }
    if (code.length !== 6) {
      toast.error("6자리 인증번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmailCode(email, code);
      timer.clear();
      toast.success("인증이 완료되었습니다.");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "인증번호가 일치하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(newPassword, email);
      toast.success("비밀번호가 성공적으로 변경되었습니다.");
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, { title: string; desc: string }> = {
    1: { title: "비밀번호 찾기", desc: "가입 시 등록한 이메일을 입력해 주세요" },
    2: { title: "인증번호 확인", desc: `${email}으로 전송된 인증번호를 입력해 주세요` },
    3: { title: "새 비밀번호 설정", desc: "새로운 비밀번호를 입력해 주세요" },
    4: { title: "변경 완료", desc: "비밀번호가 성공적으로 변경되었습니다" },
  };

  const currentStep = stepTitles[step];

  return (
    <div className="min-h-[100dvh] bg-[#F8FAF9] dark:bg-[#09090b] flex flex-col p-3 sm:p-6 md:p-8 lg:p-6">

      {/* Top-left Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex items-center gap-2.5"
      >
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-[0_8px_30px_-8px_rgba(69,102,168,0.35)]">
          <GraduationCap className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900">ASaaS</span>
      </motion.div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="w-full max-w-[440px] sm:max-w-[460px] bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 dark:border-zinc-700/50 overflow-hidden"
        >
          <div className="px-6 sm:px-8 py-8 sm:py-10">

            {/* Step Indicator */}
            {step !== 4 && (
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        s < step
                          ? "bg-primary text-white"
                          : s === step
                          ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(69,102,168,0.4)]"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {s < step ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        s
                      )}
                    </div>
                    {s < 3 && (
                      <div className={`w-8 sm:w-12 h-0.5 rounded-full transition-all duration-300 ${s < step ? "bg-primary" : "bg-zinc-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{currentStep.title}</h2>
                <p className="text-sm text-zinc-400 mt-1.5">{currentStep.desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Step Forms */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSendCode}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">이메일</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300">
                        <Mail className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </div>
                      <input
                        type="email"
                        placeholder="example@university.ac.kr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-xl py-3.5 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>
                  <SubmitButton loading={loading} label="인증번호 전송" />
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyCode}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-700">인증번호</label>
                      <span className={`text-sm font-mono font-semibold ${timer.expired ? "text-rose-500" : timer.timeLeft <= 30 ? "text-amber-500" : "text-primary-dark"}`}>
                        {timer.expired ? "만료됨" : timer.formatted}
                      </span>
                    </div>
                    <OtpInput value={code} onChange={setCode} disabled={timer.expired} accentColor="primary" />
                    {timer.expired && (
                      <p className="text-xs text-rose-500 text-center">인증번호가 만료되었습니다. 재전송해 주세요.</p>
                    )}
                  </div>
                  {!timer.expired && <SubmitButton loading={loading} label="인증 확인" />}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className={`w-full text-sm transition-colors ${timer.expired ? "font-medium text-primary-dark hover:text-primary-dark" : "text-zinc-400 hover:text-primary-dark"}`}
                  >
                    인증번호 재전송
                  </button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">새 비밀번호</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300">
                        <Lock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </div>
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="8자 이상 입력"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-xl py-3.5 pl-11 pr-12 text-zinc-900 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
                      >
                        {showNew ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">비밀번호 확인</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300">
                        <Lock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </div>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-xl py-3.5 pl-11 pr-12 text-zinc-900 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-rose-500 mt-1">비밀번호가 일치하지 않습니다</p>
                    )}
                  </div>

                  {/* Password Tips */}
                  <div className="bg-[#4566A8]/5 border border-[#4566A8]/15 rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                      <span className="text-xs font-semibold">안전한 비밀번호 팁</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <CircleCheck className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
                      <span className="text-xs">8자 이상의 영문, 숫자 조합</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <CircleCheck className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
                      <span className="text-xs">생일, 전화번호 등 쉬운 개인정보 제외</span>
                    </div>
                  </div>

                  <SubmitButton loading={loading} label="비밀번호 변경" />
                </motion.form>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={spring}
                  className="flex flex-col items-center text-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-zinc-500 mb-8">
                    새 비밀번호로 로그인해 주세요.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/login")}
                    className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-primary hover:bg-primary-hover shadow-[0_8px_30px_-8px_rgba(69,102,168,0.3)] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    로그인으로 이동
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to Login */}
            {step !== 4 && (
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <motion.button
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-primary-dark transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                  로그인으로 돌아가기
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <div className="pt-2">
      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-primary hover:bg-primary-hover shadow-[0_8px_30px_-8px_rgba(69,102,168,0.3)] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          <>
            {label}
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </>
        )}
      </motion.button>
    </div>
  );
}
