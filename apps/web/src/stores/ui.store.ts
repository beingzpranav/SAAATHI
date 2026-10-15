import { create } from 'zustand';

export type Theme = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
}

interface UiState {
  theme: Theme;
  isMobileMenuOpen: boolean;
  liteMode: boolean;
  toast: ToastMessage | null;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setLiteMode: (enabled: boolean) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  hideToast: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('saathi-theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const applyThemeToDom = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('saathi-theme', theme);
};

export const useUiStore = create<UiState>((set) => ({
  theme: getInitialTheme(),
  isMobileMenuOpen: false,
  liteMode: false,
  toast: null,

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      applyThemeToDom(nextTheme);
      return { theme: nextTheme };
    }),

  setTheme: (theme: Theme) => {
    applyThemeToDom(theme);
    set({ theme });
  },

  setMobileMenuOpen: (isMobileMenuOpen: boolean) => set({ isMobileMenuOpen }),

  setLiteMode: (liteMode: boolean) => set({ liteMode }),

  showToast: (message: string, type = 'info') =>
    set({
      toast: {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type,
      },
    }),

  hideToast: () => set({ toast: null }),
}));
