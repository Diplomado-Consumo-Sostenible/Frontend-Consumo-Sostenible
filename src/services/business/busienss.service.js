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

export const postBusiness = async (businessData, token) => {
  try {
    const response = await API.post('/business', businessData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al registrar el negocio' };
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
