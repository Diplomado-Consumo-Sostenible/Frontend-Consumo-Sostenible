import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { isTokenExpired } from '../utils/jwt.utils';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Rutas que requieren autenticación — si el token expira aquí sí redirigimos al login
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

/**
 * Limpia el token expirado/inválido.
 * Solo redirige al login si el usuario estaba en una ruta protegida;
 * en rutas públicas simplemente elimina el token y deja que la página
 * siga funcionando en modo invitado.
 */
const clearSession = () => {
  removeToken();
  if (isOnProtectedRoute() && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

// ── Interceptor de solicitud ───────────────────────────────────────
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
      // Ruta pública: continuar sin cabecera de auth (modo invitado)
      return config;
    }
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ── Interceptor de respuesta ───────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  },
);

export default API;