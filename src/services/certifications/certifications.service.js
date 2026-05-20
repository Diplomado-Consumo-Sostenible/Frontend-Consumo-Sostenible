import api from '../../api/api';

export const getMyCertifications = async ({ page = 1, limit = 9 } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    const res = await api.get(`/certifications/management/my-certifications?${params}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404)
      return { data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1, totalPending: 0, totalApproved: 0 } };
    throw err;
  }
};

export const updateCertification = async (id, data) => {
  const res = await api.patch(`/certifications/${id}`, data);
  return res.data;
};

export const createCertification = async (data) => {
  const res = await api.post('/certifications', data);
  return res.data;
};

export const deleteCertification = async (id) => {
  const res = await api.delete(`/certifications/${id}`);
  return res.data;
};
