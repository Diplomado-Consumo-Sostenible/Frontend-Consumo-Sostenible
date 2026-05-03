import { useCallback, useEffect, useState } from 'react';
import { getVisitedBusinesses } from '../utils/visitedBusinesses';

export default function useVisitedBusinesses() {
  const [visited, setVisited] = useState(() => getVisitedBusinesses());

  const refresh = useCallback(() => setVisited(getVisitedBusinesses()), []);

  useEffect(() => {
    window.addEventListener('visitedBusinessesUpdated', refresh);
    return () => window.removeEventListener('visitedBusinessesUpdated', refresh);
  }, [refresh]);

  return { visited };
}
