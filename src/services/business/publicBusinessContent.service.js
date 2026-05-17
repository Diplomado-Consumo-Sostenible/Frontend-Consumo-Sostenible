import API from '../../api/api';

export const getPublicProducts = async (businessId, { page = 1, limit = 50 } = {}) => {
  try {
    const { data } = await API.get(`/product/business/${businessId}`, {
      params: { page, limit },
    });
    return data?.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getPublicCertifications = async (businessId, { page = 1, limit = 50 } = {}) => {
  try {
    const { data } = await API.get(`/certifications/business/${businessId}`, {
      params: { page, limit },
    });
    return data?.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};
