import { useCallback, useEffect, useState } from 'react';
import { getMyReviews, deleteMyReview } from '../services/user/reviews.service';

export default function useMyReviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyReviews({ limit: 50 });
      setReviews(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      // 404 significa "sin reseñas", no es un error real
      if (err?.response?.status === 404) {
        setReviews([]);
      } else {
        setError(err?.message ?? 'No se pudieron cargar las reseñas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (reviewId) => {
    await deleteMyReview(reviewId);
    setReviews((prev) => prev.filter((r) => r.id_review !== reviewId));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { reviews, loading, error, retry: fetch, remove };
}
