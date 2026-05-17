import { useState, useEffect, useMemo } from 'react';
import useBusinessProfile from './useBusinessProfile';
import { fetchAllFollowers, fetchAllReviews, aggregateChartData } from '../services/stats/stats.service';

export default function useBusinessStats(period, { skip = false } = {}) {
  const { business, loading, error, retry } = useBusinessProfile();
  const [rawData,      setRawData]      = useState({ followers: [], reviews: [] });
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError,   setChartError]   = useState(null);

  useEffect(() => {
    if (!business?.id_business || skip) return;

    let cancelled = false;
    setChartLoading(true);
    setChartError(null);

    Promise.all([
      fetchAllFollowers(),
      fetchAllReviews(business.id_business),
    ])
      .then(([followers, reviews]) => {
        if (!cancelled) setRawData({ followers, reviews });
      })
      .catch((err) => {
        if (!cancelled) setChartError(err?.message ?? 'No se pudieron cargar los datos de la gráfica.');
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });

    return () => { cancelled = true; };
  }, [business?.id_business, skip]);

  const chartData = useMemo(() => ({
    followers: aggregateChartData(rawData.followers, 'fecha_seguimiento', period),
    reviews:   aggregateChartData(rawData.reviews,   'fecha',             period),
  }), [rawData, period]);

  const businessWithCount = useMemo(() => {
    if (!business) return null;
    return {
      ...business,
      // Si el fetch trajo seguidores, usar ese conteo; si no, usar el del negocio
      followers_count: rawData.followers.length > 0
        ? rawData.followers.length
        : (business.followers_count ?? 0),
    };
  }, [business, rawData.followers]);

  return {
    business:    businessWithCount,
    chartData,
    rawFollowers: rawData.followers,
    loading,
    chartLoading,
    error,
    chartError,
    retry,
  };
}
