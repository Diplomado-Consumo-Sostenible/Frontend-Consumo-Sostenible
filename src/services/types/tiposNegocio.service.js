import API from '../../api/api';

export const getTiposNegocio = async () => {
  try {
    const response = await API.get('/category');
    return response.data.data || response.data || [];
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener los tipos de negocio' };
  }
};
