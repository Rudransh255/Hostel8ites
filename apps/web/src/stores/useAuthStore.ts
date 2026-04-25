'use client';

import { create } from 'zustand';

interface AuthState {
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    hostelName: string;
    roomNumber: string;
    role: 'buyer' | 'seller';
  } | null;
  accessToken: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthState['user']) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, accessToken: null }),
}));
