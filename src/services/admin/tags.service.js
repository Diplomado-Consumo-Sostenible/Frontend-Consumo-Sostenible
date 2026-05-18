import API from '../../api/api';

export const getTags = async () => {
  try {
    const res = await API.get('/tags');
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return [];
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
