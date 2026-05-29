import API from '../../api/api';

const extractError = (error) => {
  const data = error?.response?.data;
  if (!data) return { message: 'Error de conexión con el servidor' };
  const msg = Array.isArray(data.message) ? data.message[0] : data.message;
  return { message: msg || 'Error inesperado' };
};

export const getMyProfile = async () => {
  try {
    const response = await API.get('/perfil/me');
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateMyProfile = async (data) => {
  try {
    const response = await API.patch('/perfil/me', data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getAllProfiles = async (filters = {}) => {
  try {
    const response = await API.get('/perfil', { params: filters });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const getProfileById = async (id) => {
  try {
    const response = await API.get(`/perfil/${id}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateMyProfilePhoto = async (fotoUrl) => {
  try {
    const response = await API.patch('/perfil/me/foto', { foto_perfil: fotoUrl });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

export const updateProfileAsAdmin = async (id, data) => {
  try {
    const response = await API.patch(`/perfil/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
