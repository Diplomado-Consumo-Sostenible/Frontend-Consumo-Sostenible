import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { isTokenExpired } from '../utils/jwt.utils';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/** Limpia la sesión y redirige al login sin importar el contexto de React */
const forceLogout = () => {
  removeToken();
  // Evitar bucle infinito si ya estamos en /login
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

// ── Interceptor de solicitud ───────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    // Verificación proactiva: si el token expiрó, cerrar sesión antes de enviar
    if (isTokenExpired(token)) {
      forceLogout();
      return Promise.reject(new Error('Sesión expirada'));
    }
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ── Interceptor de respuesta ───────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor rechaza la petición por token inválido o expirado
    if (error.response?.status === 401) {
      forceLogout();
    }
    return Promise.reject(error);
  },
);

export default API;