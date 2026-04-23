import API from '../api/api';

export const getGeneros = async () => {
  try {
    const response = await API.get('/genero');
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};
