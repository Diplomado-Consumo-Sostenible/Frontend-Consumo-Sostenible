import { useState, useEffect, useCallback } from 'react';
import { getPublicBusinesses } from '../services/business/explore.service';

export default function usePublicBusinesses(filters = {}) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const filtersKey = JSON.stringify(filters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicBusinesses(filters);
      setBusinesses(data);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los negocios');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { businesses, loading, error, retry: fetch };
}
