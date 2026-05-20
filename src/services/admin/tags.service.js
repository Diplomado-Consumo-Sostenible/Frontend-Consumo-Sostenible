import API from '../../api/api';

export const getTags = async ({ page = 1, limit = 15 } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    const res = await API.get(`/tags/admin?${params}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404)
      return { data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1 } };
    throw err;
  }
};

export const createTag = async (tag) => {
  const res = await API.post('/tags', { tag });
  return res.data;
};

export const updateTag = async (id, tag) => {
  const res = await API.patch(`/tags/${id}`, { tag });
  return res.data;
};

export const deleteTag = async (id) => {
  const res = await API.delete(`/tags/${id}`);
  return res.data;
};
