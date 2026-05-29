import API from '../../api/api';

export const getDepartamentos = async () => {
  try {
    const res = await API.get('/departamentos');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener departamentos' };
  }
};

export const getMunicipiosByDepartamento = async (id) => {
  try {
    const res = await API.get(`/municipios/departamento/${id}`, { params: { limit: 200 } });
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener municipios' };
  }
};

export const getMunicipioById = async (id) => {
  try {
    const res = await API.get(`/municipios/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener el municipio' };
  }
};
