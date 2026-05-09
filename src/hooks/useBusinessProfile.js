import { useCallback, useEffect, useState } from 'react';
import { getMyBusinesses } from '../services/business/busienss.service';

export default function useBusinessProfile() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchBusiness = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBusinesses();
      // El endpoint devuelve un array; el owner tiene un único negocio activo
      setBusiness(Array.isArray(data) ? (data[0] ?? null) : data);
    } catch (err) {
      setError(err?.message || 'Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  return { business, loading, error, retry: fetchBusiness };
}
