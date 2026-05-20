import API from '../../api/api';

export const getSavedGeneralSummary = async (businessId) => {
  const { data } = await API.get(`/reviews/summary/business/${businessId}/general`);
  return data;
};

export const getWeeklySummary = async (businessId) => {
  const { data } = await API.get(`/reviews/summary/business/${businessId}/weekly`);
  return data;
};

export const regenerateGeneralSummary = async (businessId) => {
  const { data } = await API.post(`/reviews/summary/business/${businessId}/general/regenerate`);
  return data;
};
