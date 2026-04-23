import axios from 'axios';
import { toast } from 'sonner';
import { clearSession, getSession, getToken } from '../utils/storage';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error('Sesión expirada. Por favor inicia sesión de nuevo.');
      clearSession();
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else if (status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
      const session = getSession();
      const fallback = session?.rol?.toUpperCase() === 'ADMIN' ? '/adminDashboard' : '/dashboard';
      setTimeout(() => {
        window.location.href = fallback;
      }, 1500);
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta de nuevo más tarde.');
    }

    return Promise.reject(error);
  },
);

export default API;
