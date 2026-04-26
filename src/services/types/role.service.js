import API from '../../api/api';

export const getRoles = async () => {
  try {
    const response = await API.get('/rol');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener los roles' };
  }
};
