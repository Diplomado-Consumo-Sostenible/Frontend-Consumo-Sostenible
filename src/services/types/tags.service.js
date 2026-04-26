import API from '../../api/api';

export const getTags = async () => {
  try {
    const response = await API.get('/tags');
    return response.data.data || response.data || [];
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener los tags' };
  }
};
