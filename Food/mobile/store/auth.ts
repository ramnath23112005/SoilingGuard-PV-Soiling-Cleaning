import { create } from 'zustand';
import { apiRequest, storeTokens, clearTokens, getAccessToken, onSessionExpired } from '../services/api';
import type { AuthResponse, PublicUser, FitnessProfileDoc } from '../types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: Status;
  user: PublicUser | null;
  profile: FitnessProfileDoc | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth?: string;
    gender?: string;
    experienceLevel?: string;
  }) => Promise<void>;
  logout: (serverCall?: boolean) => Promise<void>;
  refreshMe: () => Promise<void>;
  setProfile: (profile: FitnessProfileDoc) => void;
  setUser: (user: PublicUser) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  profile: null,

  initialize: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ status: 'unauthenticated' });
        return;
      }
      const me = await apiRequest<{ user: PublicUser; profile: FitnessProfileDoc | null }>('/users/me');
      set({ status: 'authenticated', user: me.user, profile: me.profile });
    } catch {
      set({ status: 'unauthenticated', user: null, profile: null });
    }
  },

  login: async (email, password) => {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    await storeTokens(res.accessToken, res.refreshToken);
    const me = await apiRequest<{ user: PublicUser; profile: FitnessProfileDoc | null }>('/users/me');
    set({ status: 'authenticated', user: me.user, profile: me.profile });
  },

  register: async (input) => {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    });
    await storeTokens(res.accessToken, res.refreshToken);
    set({ status: 'authenticated', user: res.user, profile: null });
    const me = await apiRequest<{ user: PublicUser; profile: FitnessProfileDoc | null }>('/users/me');
    set({ user: me.user, profile: me.profile });
  },

  logout: async (serverCall = true) => {
    try {
      if (serverCall) {
        const { getRefreshToken } = await import('../services/api');
        const refreshToken = await getRefreshToken();
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken },
          auth: false,
        });
      }
    } catch {
      /* best effort */
    }
    await clearTokens();
    set({ status: 'unauthenticated', user: null, profile: null });
  },

  refreshMe: async () => {
    try {
      const me = await apiRequest<{ user: PublicUser; profile: FitnessProfileDoc | null }>('/users/me');
      set({ user: me.user, profile: me.profile, status: 'authenticated' });
    } catch {
      /* keep current state */
    }
  },

  setProfile: (profile) => set({ profile }),
  setUser: (user) => set({ user }),
}));

onSessionExpired(() => {
  useAuthStore.setState({ status: 'unauthenticated', user: null, profile: null });
});
