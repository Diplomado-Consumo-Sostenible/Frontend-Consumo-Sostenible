import API from '../../api/api';

export const getPublicBusinessById = async (id) => {
  const { data } = await API.get(`/business/${id}`);
  return data;
};
