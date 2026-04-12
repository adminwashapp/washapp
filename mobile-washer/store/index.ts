import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'WASHER';
  washerProfile?: {
    id: string;
    accountStatus: string;
    isOnline: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOnline: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    set({ user: null, isAuthenticated: false, isOnline: false });
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('accessToken');
      if (stored && token) {
        set({ user: JSON.parse(stored), isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setOnlineStatus: (isOnline) => set({ isOnline }),
}));
