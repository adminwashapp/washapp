import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CLIENT' | 'WASHER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

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
    set({ user: null, isAuthenticated: false });
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
}));

interface BookingState {
  serviceType: 'EXTERIOR' | 'INTERIOR' | 'FULL' | null;
  missionType: 'INSTANT' | 'BOOKING' | null;
  address: string;
  lat: number;
  lng: number;
  vehicleId: string | null;
  scheduledAt: string | null;
  currentMissionId: string | null;
  setService: (t: 'EXTERIOR' | 'INTERIOR' | 'FULL') => void;
  setMissionType: (t: 'INSTANT' | 'BOOKING') => void;
  setLocation: (address: string, lat: number, lng: number) => void;
  setVehicle: (id: string) => void;
  setScheduledAt: (d: string) => void;
  setMissionId: (id: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  serviceType: null,
  missionType: null,
  address: '',
  lat: 5.3599517,
  lng: -4.0082563,
  vehicleId: null,
  scheduledAt: null,
  currentMissionId: null,
  setService: (serviceType) => set({ serviceType }),
  setMissionType: (missionType) => set({ missionType }),
  setLocation: (address, lat, lng) => set({ address, lat, lng }),
  setVehicle: (vehicleId) => set({ vehicleId }),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setMissionId: (currentMissionId) => set({ currentMissionId }),
  reset: () =>
    set({
      serviceType: null,
      missionType: null,
      address: '',
      lat: 5.3599517,
      lng: -4.0082563,
      vehicleId: null,
      scheduledAt: null,
      currentMissionId: null,
    }),
}));
