import API from '../../api/api';

export const getReportedReviews = async ({ page = 1, limit = 15, reason } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (reason) params.set('reason', reason);
  try {
    const res = await API.get(`/reviews/reports/reported/admin-queue?${params}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return { data: [], meta: { total: 0, totalGlobal: 0, page: 1, totalPages: 1 } };
    throw err;
  }
};

export const resolveReport = async (reviewId, action, admin_notes = '') => {
  const body = { action };
  if (admin_notes) body.admin_notes = admin_notes;
  const res = await API.patch(`/reviews/reports/resolve/${reviewId}`, body);
  return res.data;
};
