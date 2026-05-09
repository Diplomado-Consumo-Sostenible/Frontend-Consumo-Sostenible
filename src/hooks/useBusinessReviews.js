import { useState, useEffect, useCallback } from 'react';
import { getBusinessReviews } from '../services/stats/stats.service';

export default function useBusinessReviews(businessId) {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [filter, setFilter] = useState(null);
  const [nextPage, setNextPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (page, ratingFilter, append) => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBusinessReviews(businessId, {
        page,
        limit: 10,
        rating: ratingFilter ?? undefined,
      });
      setMeta(result.meta);
      setReviews(prev => append ? [...prev, ...result.data] : result.data);
    } catch {
      setError('No se pudieron cargar las reseñas');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    setNextPage(2);
    fetchPage(1, filter, false);
  }, [filter, fetchPage]);

  const loadMore = useCallback(() => {
    fetchPage(nextPage, filter, true);
    setNextPage(p => p + 1);
  }, [fetchPage, nextPage, filter]);

  const hasMore = meta ? nextPage <= meta.totalPages : false;

  return { reviews, meta, filter, setFilter, loadMore, hasMore, loading, error };
}
