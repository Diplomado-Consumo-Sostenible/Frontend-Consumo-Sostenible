import API from '../../api/api';

export const getGeneros = async (page = 1, limit = 20) => {
  try {
    const res = await API.get(`/genero?page=${page}&limit=${limit}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return { data: [], meta: { total: 0, page: 1, totalPages: 1 } };
    throw err;
  }
};

export const createGenero = async (nombre) => {
  const res = await API.post('/genero', { nombre });
  return res.data;
};

export const updateGenero = async (id, nombre) => {
  const res = await API.patch(`/genero/${id}`, { nombre });
  return res.data;
};

export const deleteGenero = async (id) => {
  const res = await API.delete(`/genero/${id}`);
  return res.data;
};
