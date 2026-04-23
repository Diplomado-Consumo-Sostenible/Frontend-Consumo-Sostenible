import API from '../api/api';
import { getToken } from '../utils/storage';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getUsers = async ({ page = 1, limit = 10, search = '', order = 'ASC' } = {}) => {
  const params = new URLSearchParams({ page, limit, order });
  if (search) params.set('search', search);
  const response = await API.get(`/users?${params}`, authHeaders());
  return response.data;
};

export const createUser = async (data) => {
  const response = await API.post('/users/register', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await API.patch(`/users/${id}`, data, authHeaders());
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await API.patch(`/users/${id}/toggle-status`, {}, authHeaders());
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/users/${id}`, authHeaders());
  return response.data;
};
