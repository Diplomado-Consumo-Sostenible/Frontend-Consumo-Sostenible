import API from '../../api/api';

export const getBusiness = async () => {
  try {
    const response = await API.get('/business');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener los negocios' };
  }
};

export const getMyBusinesses = async () => {
  try {
    const response = await API.get('/business/management/my-businesses');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener tus negocios' };
  }
};

export const postBusiness = async (businessData) => {
  try {
    const response = await API.post('/business', businessData);
    return response.data;
  } catch (error) {
    const err = error.response?.data || { message: 'Error al registrar el negocio' };
    err._httpStatus = error.response?.status ?? 0;
    throw err;
  }
};

export const updateMyBusiness = async (id, data) => {
  try {
    const response = await API.patch(`/business/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar el negocio' };
  }
};

export const deleteMyBusiness = async (id, password) => {
  try {
    const response = await API.delete(`/business/${id}`, { data: { password } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al eliminar el negocio' };
  }
};

export const requestBusinessReactivation = async (id) => {
  try {
    const response = await API.patch(`/business/${id}/request-reactivation`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al solicitar la reactivación' };
  }
};

export const reactivateMyBusiness = async (id) => {
  try {
    const response = await API.patch(`/business/${id}/reactivate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al reactivar el negocio' };
  }
};
