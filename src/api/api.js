import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { isTokenExpired } from '../utils/jwt.utils';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});


const PROTECTED_PREFIXES = [
  '/dashboardBusiness',
  '/adminDashboard',
  '/favoritos',
  '/resenas',
  '/perfil',
  '/dashboard',
];

const isOnProtectedRoute = () =>
  PROTECTED_PREFIXES.some((p) => window.location.pathname.startsWith(p));


const clearSession = () => {
  removeToken();
  if (isOnProtectedRoute() && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

// ── Interceptor de solicitud ──
API.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    if (isTokenExpired(token)) {
      removeToken(); // limpiar siempre
      if (isOnProtectedRoute()) {
        // Ruta protegida: abortar y redirigir
        window.location.href = '/login';
        return Promise.reject(new Error('Sesión expirada'));
      }
      return config;
    }
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ── Interceptor de respuesta ──
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        clearSession();
      }
    }
    return Promise.reject(error);
  },
);

export default API;