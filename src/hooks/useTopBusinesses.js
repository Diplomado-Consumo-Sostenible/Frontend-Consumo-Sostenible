import { useState, useEffect, useCallback } from 'react';
import { getTopBusinesses } from '../services/business/explore.service';

export default function useTopBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopBusinesses();
      setBusinesses(data);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los negocios destacados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { businesses, loading, error, retry: fetch };
}
