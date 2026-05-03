import api from '../../api/api';

export const getMyCertifications = async () => {
  try {
    const res = await api.get('/certifications/management/my-certifications');
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return [];
    throw err;
  }
};

export const createCertification = async (data) => {
  const res = await api.post('/certifications', data);
  return res.data;
};

export const deleteCertification = async (id) => {
  const res = await api.delete(`/certifications/${id}`);
  return res.data;
};
