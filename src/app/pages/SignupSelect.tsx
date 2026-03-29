import { Link } from "react-router";
import { motion } from "motion/react";
import { User, BookOpen, GraduationCap, ArrowRight } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function SignupSelect() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAF9] dark:bg-[#09090b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="w-full max-w-lg space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">ASaaS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">회원가입</h1>
          <p className="text-base text-zinc-400 mt-2">가입 유형을 선택해 주세요</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/signup/student"
            className="flex flex-col items-center justify-center gap-4 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-2xl py-16 hover:bg-primary/10 hover:border-primary hover:text-zinc-900 transition-colors"
          >
            <User className="w-12 h-12" strokeWidth={1.5} />
            <span className="text-lg">학생 가입</span>
          </Link>

          <Link
            to="/signup/professor"
            className="flex flex-col items-center justify-center gap-4 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-2xl py-16 hover:bg-primary/10 hover:border-primary hover:text-zinc-900 transition-colors"
          >
            <BookOpen className="w-12 h-12" strokeWidth={1.5} />
            <span className="text-lg">교수 가입</span>
          </Link>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
