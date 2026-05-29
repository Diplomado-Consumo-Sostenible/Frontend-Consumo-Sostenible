import API from '../../api/api';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken } from '../../utils/storage';

const extractError = (error) => {
  const data = error?.response?.data;
  if (!data) return { message: 'Error de conexión con el servidor' };
  const msg = Array.isArray(data.message) ? data.message[0] : data.message;
  return { message: msg || 'Error inesperado' };
};

export const getAllUsers = async ({ page = 1, limit = 15, rol, sortBy, order } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (rol)    params.set('rol',    rol);
    if (sortBy) params.set('sortBy', sortBy);
    if (order)  params.set('order',  order);
    const response = await API.get(`/user?${params}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const createUser = async (data) => {
  try {
    const response = await API.post('/user', data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await API.patch(`/user/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const toggleUserStatus = async (id, isActive) => {
  try {
    const response = await API.patch(`/user/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const changeEmail = async ({ newEmail, password }) => {
  try {
    const response = await API.patch('/user/me/email', { newEmail, password });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await API.patch('/user/me/password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await API.delete(`/user/${id}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteMyAccount = async (password) => {
  const decoded = decodeToken(getToken());
  const id = decoded?.sub != null ? Number(decoded.sub) : null;
  if (!id) throw { message: 'No se pudo identificar el usuario.' };
  try {
    const response = await API.delete(`/user/${id}`, { data: { password } });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
