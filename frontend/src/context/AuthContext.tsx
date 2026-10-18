import * as React from "react";
import { api, authEvents, clearSession, getStoredUser, getToken, setSession } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: User["role"][]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => getStoredUser());
  const [token, setToken] = React.useState<string | null>(() => getToken());
  const [initializing, setInitializing] = React.useState<boolean>(() => !!getToken());

  React.useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setToken(null);
    };
    authEvents.addEventListener("logout", onLogout);
    return () => authEvents.removeEventListener("logout", onLogout);
  }, []);

  React.useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    api
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          clearSession();
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = React.useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    setSession(res.access_token, res.user);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = React.useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = React.useCallback(
    (...roles: User["role"][]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  const value = React.useMemo(
    () => ({ user, token, initializing, login, logout, hasRole }),
    [user, token, initializing, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
