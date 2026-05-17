import API from '../../api/api';

export const getBusinessReviewsPublic = async (businessId, { page = 1, limit = 10, order = 'DESC', rating = null } = {}) => {
  try {
    const params = { page, limit, order };
    if (rating) params.rating = rating;
    const { data } = await API.get(`/reviews/business/${businessId}`, { params });
    return data;
  } catch (error) {
    if (error?.response?.status === 404)
      return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: page } };
    throw error;
  }
};

export const getMyReviewForBusiness = async (businessId) => {
  try {
    const { data } = await API.get(`/reviews/my-review/business/${businessId}`);
    return data;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const createReview   = async (businessId, payload) =>
  (await API.post(`/reviews/business/${businessId}`, payload)).data;

export const updateReview   = async (reviewId, payload) =>
  (await API.patch(`/reviews/${reviewId}`, payload)).data;

export const reportReview   = async (reviewId, reason) =>
  (await API.post(`/reviews/${reviewId}/report`, { reason })).data;
