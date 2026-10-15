import { create } from 'zustand';
import type { UserProfile, HouseholdSummary } from '@saathi/shared';
import { apiClient } from '../lib/apiClient.js';

interface SessionState {
  user: UserProfile | null;
  household: HouseholdSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile) => void;
  setHousehold: (household: HouseholdSummary | null) => void;
  clearUser: () => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  household: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user: UserProfile) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  setHousehold: (household: HouseholdSummary | null) =>
    set({
      household,
    }),

  clearUser: () =>
    set({
      user: null,
      household: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get<{ user: UserProfile }>('/auth/me');
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
