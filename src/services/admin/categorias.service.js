import API from '../../api/api';

export const getCategorias = async () => {
  try {
    const res = await API.get('/category');
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return [];
    throw err;
  }
};

export const createCategoria = async (category) => {
  const res = await API.post('/category', { category });
  return res.data;
};

export const updateCategoria = async (id, category) => {
  const res = await API.patch(`/category/${id}`, { category });
  return res.data;
};

export const deleteCategoria = async (id) => {
  const res = await API.delete(`/category/${id}`);
  return res.data;
};
