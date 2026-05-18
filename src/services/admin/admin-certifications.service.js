import API from '../../api/api';

export const getAdminCertifications = async ({ page = 1, limit = 15, status } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  try {
    const res = await API.get(`/certifications/admin/list?${params}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return { data: [], meta: { total: 0, page: 1, totalPages: 1 } };
    throw err;
  }
};

export const changeCertificationStatus = async (id, status) => {
  const res = await API.patch(`/certifications/admin/${id}/status`, { status });
  return res.data;
};

export const deleteCertificationAdmin = async (id) => {
  const res = await API.delete(`/certifications/${id}`);
  return res.data;
};
