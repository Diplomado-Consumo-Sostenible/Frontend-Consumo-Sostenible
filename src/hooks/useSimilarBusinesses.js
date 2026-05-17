import { useCallback, useEffect, useState } from 'react';
import { getPublicBusinesses } from '../services/business/explore.service';

export default function useSimilarBusinesses(categoryId, excludeId) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const data = await getPublicBusinesses({ id_category: categoryId, limit: 4 });
      setBusinesses(data.filter((b) => b.id_business !== excludeId).slice(0, 3));
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, excludeId]);

  useEffect(() => { load(); }, [load]);

  return { businesses, loading };
}
