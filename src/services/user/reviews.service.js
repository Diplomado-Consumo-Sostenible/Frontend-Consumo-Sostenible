import API from '../../api/api';

export const getMyReviews = async ({ page = 1, limit = 10 } = {}) => {
  const response = await API.get('/reviews/my-history', { params: { page, limit } });
  return response.data;
};

export const deleteMyReview = async (reviewId) => {
  const response = await API.delete(`/reviews/${reviewId}`);
  return response.data;
};
