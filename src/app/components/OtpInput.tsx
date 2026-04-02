import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accentColor?: "primary" | "rose";
}

export function OtpInput({ value, onChange, disabled, accentColor = "primary" }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = char;
    onChange(newDigits.join(""));
    if (char && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const newDigits = [...digits];
        newDigits[idx] = "";
        onChange(newDigits.join(""));
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const borderFilled = accentColor === "rose" ? "border-rose-400 bg-rose-50/60" : "border-primary bg-primary/5";
  const borderEmpty = accentColor === "rose" ? "border-zinc-200" : "border-zinc-200";
  const focusRing = accentColor === "rose" ? "focus:ring-rose-200 focus:border-rose-400" : "focus:ring-primary/30 focus:border-primary";

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }, (_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={digits[idx]}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border-2 bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:bg-zinc-50 ${focusRing} ${digits[idx] ? borderFilled : borderEmpty}`}
        />
      ))}
    </div>
  );
}
