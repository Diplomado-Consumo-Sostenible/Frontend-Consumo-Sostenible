import { useCallback, useEffect, useState } from 'react';
import API from '../api/api';

/**
 * Fetches the total review count across a list of business IDs.
 * Uses limit=1 requests so the payload is minimal — only meta.totalItems matters.
 * Errors per-business are swallowed and count as 0 (graceful degradation).
 */
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

  // Stable key so the effect only re-fires when the actual IDs change
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
