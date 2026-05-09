import API from '../../api/api';

export const followBusiness = async (businessId) => {
  try {
    const response = await API.post(`/follows/${businessId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al seguir el negocio' };
  }
};

export const unfollowBusiness = async (businessId) => {
  try {
    const response = await API.delete(`/follows/${businessId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al dejar de seguir el negocio' };
  }
};

export const getMyFollowing = async ({ page = 1, limit = 100 } = {}) => {
  try {
    const response = await API.get('/follows/my-following', { params: { page, limit } });
    const raw = response.data;
    return {
      businesses: Array.isArray(raw) ? raw : (raw?.data ?? []),
      total:      raw?.total ?? 0,
      page:       raw?.page  ?? page,
      limit:      raw?.limit ?? limit,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { businesses: [], total: 0, page, limit };
    }
    throw error.response?.data || { message: 'Error al obtener los negocios seguidos' };
  }
};
