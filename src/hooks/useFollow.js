import { useState, useEffect, useCallback } from 'react';
import { followBusiness, unfollowBusiness, getMyFollowing } from '../services/follow/follow.service';
import { getToken } from '../utils/storage';

export default function useFollow(businessId) {
  const isAuthenticated = !!getToken();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!businessId || !isAuthenticated) {
      setInitializing(false);
      return;
    }
    getMyFollowing()
      .then(businesses => {
        if (businesses) {
          // Number() evita fallos si un endpoint serializa el id como string
          setIsFollowing(
            businesses.some(b => Number(b.id_business) === Number(businessId))
          );
        }
      })
      .finally(() => setInitializing(false));
  }, [businessId, isAuthenticated]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated || loading || initializing) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowBusiness(businessId);
        setIsFollowing(false);
      } else {
        await followBusiness(businessId);
        setIsFollowing(true);
      }
      return { nowFollowing: !isFollowing };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loading, initializing, isFollowing, businessId]);

  return { isFollowing, toggle, loading, initializing, isAuthenticated };
}
