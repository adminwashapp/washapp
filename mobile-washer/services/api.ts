import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://washapp-api.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  loginWasher: (data: any) => api.post('/auth/login/washer', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

export const washerApi = {
  getProfile: () => api.get('/washers/me'),
  getReservations: () => api.get('/washers/reservations'),
  getEarnings: () => api.get('/washers/earnings'),
  getActiveMission: () => api.get('/washers/mission/active'),
  uploadPhoto: (missionId: string, type: 'BEFORE' | 'AFTER', formData: FormData) =>
    api.post(`/washers/missions/${missionId}/photo/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  cancelReservation: (id: string) => api.post(`/washers/reservations/${id}/cancel`),
  updateFcmToken: (fcmToken: string) => api.post('/washers/fcm-token', { fcmToken }),
  confirmWavePayment: (missionId: string) => api.post('/payments/wave/' + missionId + '/confirm-washer'),
  getStatsToday: () => api.get('/washers/stats/today'),
};

export const walletApi = {
  get: () => api.get('/wallet'),
  getLedger: (page = 1) => api.get(`/wallet/ledger?page=${page}`),
  withdraw: (amount: number, waveMoneyNumber: string) =>
    api.post('/wallet/withdraw', { amount, waveMoneyNumber }),
};

export const paymentsApi = {
  confirmCashWasher: (missionId: string) =>
    api.post(`/payments/cash/${missionId}/confirm-washer`),
};
