import { useCallback, useEffect, useRef, useState } from 'react';
import { followBusiness, getMyFollowing, unfollowBusiness } from '../services/follow/follow.service';

export function useFollows() {
  const [followedBusinesses, setFollowedBusinesses] = useState([]);
  const [followedIds, setFollowedIds]               = useState(new Set());
  const [loading, setLoading]                       = useState(true);
  const mountedRef                                  = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchFollowing = useCallback(async () => {
    try {
      const { businesses } = await getMyFollowing();
      if (!mountedRef.current) return;
      setFollowedBusinesses(businesses);
      setFollowedIds(new Set(businesses.map((b) => b.id_business)));
    } catch {
      if (!mountedRef.current) return;
      setFollowedBusinesses([]);
      setFollowedIds(new Set());
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFollowing(); }, [fetchFollowing]);

  const toggleFollow = useCallback(async (businessId, { onError } = {}) => {
    const isFollowing = followedIds.has(businessId);

    setFollowedIds((prev) => {
      const next = new Set(prev);
      isFollowing ? next.delete(businessId) : next.add(businessId);
      return next;
    });

    if (!isFollowing) {
      setFollowedBusinesses((prev) => prev);
    } else {
      setFollowedBusinesses((prev) =>
        prev.filter((b) => b.id_business !== businessId),
      );
    }

    try {
      if (isFollowing) {
        await unfollowBusiness(businessId);
      } else {
        await followBusiness(businessId);
        await fetchFollowing();
      }
    } catch (err) {
      if (!mountedRef.current) return;

      setFollowedIds((prev) => {
        const next = new Set(prev);
        isFollowing ? next.add(businessId) : next.delete(businessId);
        return next;
      });
      setFollowedBusinesses((prev) =>
        isFollowing ? prev : prev.filter((b) => b.id_business !== businessId),
      );

      const msg = err?.message || 'No se pudo actualizar el seguimiento';
      onError?.(msg);
    }
  }, [followedIds, fetchFollowing]);

  return { followedBusinesses, followedIds, loading, toggleFollow, refresh: fetchFollowing };
}
