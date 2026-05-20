import API from '../../api/api';

export const getCategorias = async ({ page = 1, limit = 15 } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    const res = await API.get(`/category/admin?${params}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404)
      return { data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1 } };
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
