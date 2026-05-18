import { useCallback, useEffect, useState } from 'react';
import { getToken } from '../utils/storage';
import { decodeToken } from '../utils/jwt.utils';
import {
  getBusinessReviewsPublic,
  getMyReviewForBusiness,
  createReview,
  updateReview,
} from '../services/user/publicReviews.service';
import { reportReview } from '../services/reviews/reviews-report.service';

/* ── Helpers localStorage ────────────────────────────────────── */
function storageKey(userId) {
  return `reportedReviews_${userId ?? 'anon'}`;
}
function loadReported(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}
function saveReported(userId, set) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...set]));
  } catch { /* cuota llena u otros errores — ignorar silenciosamente */ }
}

export default function useBusinessReviews(businessId, { ratingFilter = null, skipMyReview = false } = {}) {
  const [reviews,      setReviews]      = useState([]);
  const [meta,         setMeta]         = useState(null);
  const [ratingCounts, setRatingCounts] = useState({});
  const [myReview,     setMyReview]     = useState(undefined); // undefined=cargando, null=sin reseña
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(1);

  const token     = getToken();
  const decoded   = decodeToken(token);
  const currentUserId = decoded?.sub != null ? Number(decoded.sub) : null;
  const isAuthenticated = Boolean(token);

  // Inicializa desde localStorage para que persista entre recargas
  const [reported, setReported] = useState(() => loadReported(currentUserId));

  const fetchReviews = useCallback(async (p = 1) => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBusinessReviewsPublic(businessId, {
        page: p,
        limit: 10,
        ...(ratingFilter ? { rating: ratingFilter } : {}),
      });
      setReviews(p === 1 ? (res.data ?? []) : (prev) => [...prev, ...(res.data ?? [])]);
      setMeta(res.meta ?? null);
      setPage(p);
    } catch (err) {
      setError(err?.message ?? 'Error al cargar reseñas.');
    } finally {
      setLoading(false);
    }
  }, [businessId, ratingFilter]);

  const fetchMyReview = useCallback(async () => {
    if (skipMyReview || !isAuthenticated || !businessId) { setMyReview(null); return; }
    try {
      setMyReview(await getMyReviewForBusiness(businessId));
    } catch {
      setMyReview(null);
    }
  }, [businessId, isAuthenticated]);

  const fetchRatingCounts = useCallback(async () => {
    if (!businessId) return;
    try {
      const results = await Promise.all(
        [1, 2, 3, 4, 5].map((s) =>
          getBusinessReviewsPublic(businessId, { page: 1, limit: 1, rating: s })
        )
      );
      const counts = {};
      [1, 2, 3, 4, 5].forEach((s, i) => {
        counts[s] = results[i]?.meta?.totalItems ?? 0;
      });
      setRatingCounts(counts);
    } catch {
      // leave counts empty — not critical
    }
  }, [businessId]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);
  useEffect(() => { fetchMyReview(); }, [fetchMyReview]);
  useEffect(() => { fetchRatingCounts(); }, [fetchRatingCounts]);

  const submitReview = useCallback(async (payload) => {
    const res = myReview
      ? await updateReview(myReview.id_review, payload)
      : await createReview(businessId, payload);
    await Promise.all([fetchReviews(1), fetchMyReview()]);
    return res;
  }, [businessId, myReview, fetchReviews, fetchMyReview]);

  const report = useCallback(async (reviewId, reason) => {
    const res = await reportReview(reviewId, reason);
    setReported((prev) => {
      const next = new Set([...prev, reviewId]);
      saveReported(currentUserId, next);
      return next;
    });
    return res;
  }, [currentUserId]);

  const loadMore = useCallback(() => fetchReviews(page + 1), [fetchReviews, page]);

  const hasMore = meta ? meta.currentPage < meta.totalPages : false;

  return {
    reviews, meta, ratingCounts, myReview, loading, error,
    isAuthenticated, currentUserId,
    submitReview, report, reported, loadMore, hasMore,
    retry: () => fetchReviews(1),
  };
}
