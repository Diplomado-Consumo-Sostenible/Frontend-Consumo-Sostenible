import API from '../../api/api';

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('imagen', file);
  try {
    const response = await API.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al subir la imagen' };
  }
};
