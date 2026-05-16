import { useSyncExternalStore, useCallback } from "react";
import { setAccessToken, clearTokens, getAccessToken } from "../api/client";

export type Role = "student" | "professor" | "admin";

interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  userName: string | null;
  major?: string | null;
}

const AUTH_KEY = "AUTH_STATE";

function getSnapshot(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isAuthenticated: false, role: null, userName: null, major: null };
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

function mapRole(backendRole: string): Role {
  const r = backendRole.toUpperCase();
  if (r === "STUDENT" || r === "ROLE_STUDENT") return "student";
  if (r === "PROFESSOR" || r === "ROLE_PROFESSOR") return "professor";
  if (r === "MASTER" || r === "ROLE_MASTER") return "admin";
  return "student";
}

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getState);

  const login = useCallback(
    (role: string, userName: string, accessToken: string, major?: string) => {
      setAccessToken(accessToken);
      const newState: AuthState = {
        isAuthenticated: true,
        role: mapRole(role),
        userName,
        major: major || null,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(newState));
      emitChange();
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(AUTH_KEY);
    emitChange();
  }, []);

  return {
    isAuthenticated: state.isAuthenticated,
    role: state.role,
    userName: state.userName,
    major: state.major,
    login,
    logout,
  };
}
