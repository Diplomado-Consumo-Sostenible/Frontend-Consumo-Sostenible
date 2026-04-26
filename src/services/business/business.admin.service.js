import API from '../../api/api';

const extractError = (error) => {
  const data = error?.response?.data;
  if (!data) return { message: 'Error de conexión con el servidor' };
  const msg = Array.isArray(data.message) ? data.message[0] : data.message;
  return { message: msg || 'Error inesperado', status: error?.response?.status };
};

export const getBusinessesForAdmin = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));
    const response = await API.get(`/business/admin/list?${params}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) return { data: [], total: 0, page: 1, limit: 10 };
    throw extractError(error);
  }
};

export const changeBusinessStatus = async (id, status, rejectionReason) => {
  try {
    const body = { status };
    if (rejectionReason) body.rejectionReason = rejectionReason;
    const response = await API.patch(`/business/${id}/status`, body);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const toggleBusinessActive = async (id, isActive) => {
  try {
    const response = await API.patch(`/business/${id}/toggle-active`, { isActive });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const createBusiness = async (data) => {
  try {
    const response = await API.post('/business', data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateBusiness = async (id, data) => {
  try {
    const response = await API.patch(`/business/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const deleteBusiness = async (id) => {
  try {
    const response = await API.delete(`/business/${id}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
