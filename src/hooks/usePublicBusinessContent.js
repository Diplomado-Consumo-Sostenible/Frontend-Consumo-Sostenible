import { useCallback, useEffect, useState } from 'react';
import {
  getPublicProducts,
  getPublicCertifications,
} from '../services/business/publicBusinessContent.service';

export function usePublicProducts(businessId) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetch = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      setProducts(await getPublicProducts(businessId));
    } catch (err) {
      setError(err?.message ?? 'Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, error, retry: fetch };
}

export function usePublicCertifications(businessId) {
  const [certifications, setCertifications] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const fetch = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      setCertifications(await getPublicCertifications(businessId));
    } catch (err) {
      setError(err?.message ?? 'Error al cargar certificaciones.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { certifications, loading, error, retry: fetch };
}
