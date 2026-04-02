import { useSyncExternalStore, useCallback } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "APP_THEME";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return null;
}

function getEffectiveTheme(): Theme {
  return getStoredTheme() ?? "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  applyTheme(getEffectiveTheme());

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!getStoredTheme()) {
      applyTheme(getSystemTheme());
      emitChange();
    }
  });
}

let listeners: (() => void)[] = [];
let cachedTheme = getEffectiveTheme();

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  cachedTheme = getEffectiveTheme();
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  return cachedTheme;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
    emitChange();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
