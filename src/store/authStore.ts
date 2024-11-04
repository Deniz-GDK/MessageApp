import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  rememberMe: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rememberMe: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRememberMe: (remember) => set({ rememberMe: remember }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.rememberMe ? state.token : null,
        rememberMe: state.rememberMe,
      }),
    }
  )
);