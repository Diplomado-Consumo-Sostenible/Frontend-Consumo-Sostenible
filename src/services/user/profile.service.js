import API from '../../api/api';

const extractError = (error) => {
  const data = error?.response?.data;
  if (!data) return { message: 'Error de conexión con el servidor' };
  const msg = Array.isArray(data.message) ? data.message[0] : data.message;
  return { message: msg || 'Error inesperado' };
};

// Obtener mi propio perfil (ADMIN, owner, USER)
export const getMyProfile = async () => {
  try {
    const response = await API.get('/perfil/me');
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Actualizar mi propio perfil (ADMIN, owner, USER)
// data: { nombre?, foto_perfil?, id_genero? }
export const updateMyProfile = async (data) => {
  try {
    const response = await API.patch('/perfil/me', data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Obtener todos los perfiles con filtros opcionales (Solo ADMIN)
// filters: { page?, limit?, isActive?, id_genero? }
export const getAllProfiles = async (filters = {}) => {
  try {
    const response = await API.get('/perfil', { params: filters });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Obtener un perfil por ID (Solo ADMIN)
export const getProfileById = async (id) => {
  try {
    const response = await API.get(`/perfil/${id}`);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Actualizar solo la foto de mi propio perfil (ADMIN, owner, USER)
export const updateMyProfilePhoto = async (fotoUrl) => {
  try {
    const response = await API.patch('/perfil/me/foto', { foto_perfil: fotoUrl });
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};

// Actualizar cualquier perfil como administrador (Solo ADMIN)
// data: { nombre?, foto_perfil?, id_genero? }
export const updateProfileAsAdmin = async (id, data) => {
  try {
    const response = await API.patch(`/perfil/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractError(error);
  }
};
