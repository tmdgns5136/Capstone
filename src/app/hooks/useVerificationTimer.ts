import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_DURATION = 180; // 3분

export function useVerificationTimer(duration = DEFAULT_DURATION) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setTimeLeft(duration);
    setExpired(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clear();
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clear, duration]);

  useEffect(() => () => clear(), [clear]);

  const formatted = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  return { timeLeft, expired, formatted, start, clear };
}
