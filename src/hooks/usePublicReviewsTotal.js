import { useCallback, useEffect, useState } from 'react';
import API from '../api/api';

const fetchReviewCount = async (businessId) => {
  try {
    const { data } = await API.get(`/reviews/business/${businessId}`, {
      params: { page: 1, limit: 1 },
    });
    return data?.meta?.totalItems ?? 0;
  } catch {
    return 0;
  }
};

export default function usePublicReviewsTotal(businessIds = []) {
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  const idsKey = JSON.stringify(businessIds);

  const load = useCallback(async () => {
    const ids = JSON.parse(idsKey);
    if (!ids.length) return;

    setLoading(true);
    try {
      const counts = await Promise.all(ids.map(fetchReviewCount));
      setTotal(counts.reduce((acc, n) => acc + n, 0));
    } finally {
      setLoading(false);
    }
  }, [idsKey]);

  useEffect(() => { load(); }, [load]);

  return { total, loading };
}
