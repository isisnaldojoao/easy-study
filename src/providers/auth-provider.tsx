"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUserProfile,
} from "@/services/auth";
import { refreshOverdueStatuses } from "@/services/activities";
import { runNotificationEngine } from "@/services/notifications";
import type { RegisterInput, ResetPasswordInput } from "@/schemas/auth";
import type { Session, User, UserPreferences } from "@/types";
import { getSession } from "@/lib/session";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
  updateProfile: (
    data: Partial<Pick<User, "name" | "preferences">>
  ) => Promise<void>;
  updatePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const current = getSession();
    setSessionState(current);
    if (!current) {
      setUser(null);
      setLoading(false);
      return;
    }
    const full = await getCurrentUser();
    setUser(full);
    if (full) {
      await refreshOverdueStatuses(full.id);
      await runNotificationEngine(full.id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      refresh,
      async login(email, password) {
        await loginUser(email, password);
        await refresh();
      },
      async register(input) {
        await registerUser(input);
        await refresh();
      },
      logout() {
        logoutUser();
        setUser(null);
        setSessionState(null);
      },
      async resetPassword(input) {
        await resetPassword(input);
      },
      async updateProfile(data) {
        if (!user) return;
        await updateUserProfile(user.id, data);
        await refresh();
      },
      async updatePassword(current, next) {
        if (!user) return;
        await changePassword(user.id, current, next);
      },
    }),
    [user, session, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function usePreferences(): UserPreferences | null {
  const { user } = useAuth();
  return user?.preferences ?? null;
}
