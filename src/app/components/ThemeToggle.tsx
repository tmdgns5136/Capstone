import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-0.5 transition-colors duration-300 ${
        isDark
          ? "bg-primary-dark"
          : "bg-zinc-200"
      }`}
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {/* Track icons */}
      <Sun
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-30 text-zinc-400" : "opacity-0"
        }`}
        strokeWidth={2}
      />
      <Moon
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-30 text-zinc-400"
        }`}
        strokeWidth={2}
      />

      {/* Sliding knob */}
      <div
        className={`w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ${
          isDark
            ? "translate-x-7 bg-[#1a1a2e]"
            : "translate-x-0 bg-white"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-[#7B9FD4]" strokeWidth={2} />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
        )}
      </div>
    </button>
  );
}
