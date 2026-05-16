import { useCallback, useEffect, useState } from 'react';
import { getPublicBusinessById } from '../services/business/businessDetail.service';

export default function usePublicBusinessById(id) {
  const [business, setBusiness] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicBusinessById(id);
      setBusiness(data);
    } catch (err) {
      setError(err?.message ?? 'No se pudo cargar el negocio.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { business, loading, error, retry: fetch };
}
