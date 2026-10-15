import { create } from 'zustand';
import { apiClient } from '../lib/apiClient.js';
import type { PinVerifyResponse } from '@saathi/shared';

interface RoomStatus {
  hasPinSet: boolean;
  isLocked: boolean;
  lockedUntil: string | null;
  role: string;
  householdId: string | null;
}

interface RoomState {
  status: RoomStatus | null;
  isUnlocked: boolean;
  isLoadingStatus: boolean;
  isVerifying: boolean;
  verifyError: string | null;

  fetchStatus: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<PinVerifyResponse>;
  lockRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  status: null,
  isUnlocked: false,
  isLoadingStatus: false,
  isVerifying: false,
  verifyError: null,

  fetchStatus: async () => {
    set({ isLoadingStatus: true });
    try {
      const res = await apiClient.get<RoomStatus>('/rooms/status');
      set({ status: res.data, isLoadingStatus: false });
    } catch {
      set({ isLoadingStatus: false });
    }
  },

  setPin: async (pin: string) => {
    await apiClient.post('/rooms/pin/set', { pin });
    // Re-fetch after setting
    const res = await apiClient.get<RoomStatus>('/rooms/status');
    set({ status: res.data });
  },

  verifyPin: async (pin: string): Promise<PinVerifyResponse> => {
    set({ isVerifying: true, verifyError: null });
    try {
      const res = await apiClient.post<PinVerifyResponse>('/rooms/pin/verify', { pin });
      const result = res.data;
      if (result.unlocked) {
        set({ isUnlocked: true, isVerifying: false, verifyError: null });
      } else {
        set({
          isVerifying: false,
          verifyError: result.message ?? 'Incorrect PIN.',
        });
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      set({ isVerifying: false, verifyError: msg });
      return { unlocked: false, message: msg };
    }
  },

  lockRoom: () => {
    set({ isUnlocked: false, verifyError: null });
  },
}));
