import API from '../../api/api';


export const getMyNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await API.get('/notifications/my', { params: { page, limit } });
  return Array.isArray(data) ? data : (data?.data ?? []);
};


export const getMyNotificationsPaginated = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await API.get('/notifications/my', { params: { page, limit } });
  if (Array.isArray(data)) {
    return { data, total: data.length, page, limit };
  }
  return { data: data?.data ?? [], total: data?.total ?? 0, page: data?.page ?? page, limit: data?.limit ?? limit };
};


export const markNotificationRead = async (id) => {
  const { data } = await API.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await API.patch('/notifications/read-all');
  return data;
};


export const deleteNotification = async (id) => {
  const { data } = await API.delete(`/notifications/${id}`);
  return data;
};
