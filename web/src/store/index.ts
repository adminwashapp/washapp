import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CLIENT' | 'WASHER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: Cookies.get('accessToken') || null,
  isAuthenticated: !!Cookies.get('accessToken'),

  setAuth: (user, accessToken, refreshToken) => {
    Cookies.set('accessToken', accessToken, { expires: 1 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));

interface BookingState {
  step: number;
  serviceType: 'EXTERIOR' | 'INTERIOR' | 'FULL' | null;
  missionType: 'INSTANT' | 'BOOKING' | null;
  address: string;
  lat: number;
  lng: number;
  vehicleId: string | null;
  scheduledAt: string | null;
  foundWasher: any | null;
  currentMissionId: string | null;
  setStep: (step: number) => void;
  setService: (type: 'EXTERIOR' | 'INTERIOR' | 'FULL') => void;
  setMissionType: (type: 'INSTANT' | 'BOOKING') => void;
  setLocation: (address: string, lat: number, lng: number) => void;
  setVehicle: (vehicleId: string) => void;
  setScheduledAt: (date: string) => void;
  setFoundWasher: (washer: any) => void;
  setMissionId: (id: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 0,
  serviceType: null,
  missionType: null,
  address: '',
  lat: 5.3599517,
  lng: -4.0082563,
  vehicleId: null,
  scheduledAt: null,
  foundWasher: null,
  currentMissionId: null,
  setStep: (step) => set({ step }),
  setService: (serviceType) => set({ serviceType }),
  setMissionType: (missionType) => set({ missionType }),
  setLocation: (address, lat, lng) => set({ address, lat, lng }),
  setVehicle: (vehicleId) => set({ vehicleId }),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setFoundWasher: (foundWasher) => set({ foundWasher }),
  setMissionId: (currentMissionId) => set({ currentMissionId }),
  reset: () =>
    set({
      step: 0,
      serviceType: null,
      missionType: null,
      address: '',
      lat: 5.3599517,
      lng: -4.0082563,
      vehicleId: null,
      scheduledAt: null,
      foundWasher: null,
      currentMissionId: null,
    }),
}));
