import { useSyncExternalStore, useCallback } from "react";

export type Role = "student" | "professor" | "admin";

interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
}

const AUTH_KEY = "AUTH_STATE";

function getSnapshot(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isAuthenticated: false, role: null };
}

// Track subscribers for useSyncExternalStore
let listeners: (() => void)[] = [];
let cachedState = getSnapshot();

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  cachedState = getSnapshot();
  for (const listener of listeners) {
    listener();
  }
}

function getState() {
  return cachedState;
}

// Listen for storage changes from other tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === AUTH_KEY) emitChange();
  });
}

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getState);

  const login = useCallback((role: Role) => {
    const newState: AuthState = { isAuthenticated: true, role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newState));
    localStorage.setItem("DEMO_MODE", "true");
    emitChange();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("DEMO_MODE");
    emitChange();
  }, []);

  return {
    isAuthenticated: state.isAuthenticated,
    role: state.role,
    login,
    logout,
  };
}
