import API from '../../api/api';

export const getGeneros = async () => {
  try {
    const response = await API.get('/genero');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener los géneros' };
  }
};
