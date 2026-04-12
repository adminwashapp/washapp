import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          Cookies.set('accessToken', data.accessToken, { expires: 1 });
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          if (typeof window !== 'undefined') window.location.href = '/login';
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
  getSubscriptions: () => api.get('/clients/subscriptions'),
};

export const clientApi = clientsApi;

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getWashers: (status?: string, page = 1) =>
    api.get('/admin/washers', { params: { status, page, limit: 20 } }),
  activateWasher: (id: string) => api.patch(`/admin/washers/${id}/activate`),
  suspendWasher: (id: string) => api.patch(`/admin/washers/${id}/suspend`),
  validateTraining: (id: string) => api.patch(`/admin/washers/${id}/validate-training`),
  validateTest: (id: string) => api.patch(`/admin/washers/${id}/validate-test`),
  validateEquipment: (id: string) => api.patch(`/admin/washers/${id}/validate-equipment`),
  getMissions: (status?: string, page = 1) =>
    api.get('/admin/missions', { params: { status, page, limit: 20 } }),
  getComplaints: (status?: string) =>
    api.get('/admin/complaints', { params: { status } }),
  resolveComplaint: (id: string, resolutionNote: string) =>
    api.patch(`/admin/complaints/${id}/resolve`, { resolutionNote }),
  getLedger: (page = 1) => api.get('/admin/ledger', { params: { page, limit: 50 } }),
  getWithdrawals: (status?: string) =>
    api.get('/admin/withdrawals', { params: { status } }),
  processWithdrawal: (id: string, status: 'APPROVED' | 'PAID' | 'REJECTED') =>
    api.patch(`/admin/withdrawals/${id}`, { status }),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getClients: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/admin/clients', { params }),
  getClientById: (id: string) => api.get('/admin/clients/' + id),
  toggleClientBan: (id: string) => api.patch('/admin/clients/' + id + '/ban'),
  loginAdmin: (data: { phone?: string; email?: string; password: string }) =>
    api.post('/auth/login/admin', data),
};

export const applicationsApi = {
  submit: (data: any) => api.post('/applications', data),
  uploadFile: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(${API_URL}/applications/upload, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload echoue');
    const data2 = await res.json();
    return data2.url as string;
  },
  // Admin
  getAll: (status?: string) => api.get('/applications', { params: status ? { status } : {} }),
  getOne: (id: string) => api.get(/applications/),
  updateStatus: (id: string, status: string, adminNote?: string) =>
    api.patch(/applications//status, { status, adminNote }),
};

export const paymentsApi = {
  initiateOM: (missionId: string) => api.post(`/payments/orange-money/${missionId}/initiate`),
  confirmOM: (missionId: string, reference: string) =>
    api.post(`/payments/orange-money/${missionId}/confirm`, { reference }),
  confirmCashClient: (missionId: string) =>
    api.post(`/payments/cash/${missionId}/confirm-client`),
};
