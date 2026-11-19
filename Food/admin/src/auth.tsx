import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, storeTokens, clearTokens, getAccess } from './api';
import type { AuthResponse, PublicUser } from './types';

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const me = await apiRequest<{ user: PublicUser }>('/users/me');
        setUser(me.user);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    storeTokens(res.accessToken, res.refreshToken);
    if (res.user.role !== 'admin') {
      clearTokens();
      throw new Error('This account does not have admin access.');
    }
    setUser(res.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
