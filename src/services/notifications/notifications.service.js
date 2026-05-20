import API from '../../api/api';

/**
 * Obtiene el historial de notificaciones del owner autenticado.
 * GET /notifications/my?page=1&limit=20
 */
export const getMyNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await API.get('/notifications/my', { params: { page, limit } });
  // Soporta tanto array plano como { data: [], total, ... }
  return Array.isArray(data) ? data : (data?.data ?? []);
};

/**
 * Marca una notificación como leída.
 * PATCH /notifications/:id/read
 */
export const markNotificationRead = async (id) => {
  const { data } = await API.patch(`/notifications/${id}/read`);
  return data;
};

/**
 * Marca todas las notificaciones del owner como leídas.
 * PATCH /notifications/read-all
 */
export const markAllNotificationsRead = async () => {
  const { data } = await API.patch('/notifications/read-all');
  return data;
};
