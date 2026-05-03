import api from '../../api/api';

export const getProductsByBusiness = async (businessId, page = 1, limit = 20) => {
  try {
    const res = await api.get(`/product/business/${businessId}`, { params: { page, limit } });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return [];
    throw err;
  }
};

export const createProduct = async (businessId, data) => {
  const res = await api.post(`/product/business/${businessId}`, data);
  return res.data;
};

export const updateProduct = async (productId, data) => {
  const res = await api.patch(`/product/${productId}`, data);
  return res.data;
};

export const deleteProduct = async (productId) => {
  const res = await api.delete(`/product/${productId}`);
  return res.data;
};
