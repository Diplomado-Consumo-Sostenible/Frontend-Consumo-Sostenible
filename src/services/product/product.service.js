import api from '../../api/api';

export const getProductsByBusiness = async (businessId, { page = 1, limit = 12, search, sortBy, order } = {}) => {
  try {
    const params = { page, limit };
    if (search)  params.search  = search;
    if (sortBy)  params.sortBy  = sortBy;
    if (order)   params.order   = order;
    const res = await api.get(`/product/business/${businessId}`, { params });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404)
      return { data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1 } };
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
