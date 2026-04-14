import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://washapp-api.onrender.com/api';

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
  registerClient: (data: any) => api.post('/auth/register/client', data),
  loginClient: (data: any) => api.post('/auth/login/client', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  savePushToken: (token: string) => api.post('/auth/push-token', { token }),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const missionsApi = {
  create: (data: any) => api.post('/missions', data),
  getById: (id: string) => api.get(`/missions/${id}`),
  getMy: () => api.get('/missions/my'),
  validate: (id: string, data?: any) => api.post(`/missions/${id}/validate`, data),
  rate: (id: string, data: any) => api.post(`/missions/${id}/rate`, data),
  complain: (id: string, data: any) => api.post(`/missions/${id}/complaint`, data),
  cancel: (id: string) => api.post(`/missions/${id}/cancel`),
};

export const clientsApi = {
  getMe: () => api.get('/clients/me'),
  addVehicle: (data: any) => api.post('/clients/vehicles', data),
  getVehicles: () => api.get('/clients/vehicles'),
  addAddress: (data: any) => api.post('/clients/addresses', data),
  getAddresses: () => api.get('/clients/addresses'),
};

export const paymentsApi = {
  initiateOM: (missionId: string) => api.post(`/payments/orange-money/${missionId}/initiate`),
  confirmOM: (missionId: string, reference: string) =>
    api.post(`/payments/orange-money/${missionId}/confirm`, { reference }),
  confirmCashClient: (missionId: string) =>
    api.post(`/payments/cash/${missionId}/confirm-client`),
};
