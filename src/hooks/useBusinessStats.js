import { useState, useEffect, useMemo } from 'react';
import useBusinessProfile from './useBusinessProfile';
import { fetchAllFollowers, fetchAllReviews, aggregateChartData } from '../services/stats/stats.service';

export default function useBusinessStats(period) {
  const { business, loading, error, retry } = useBusinessProfile();
  const [rawData, setRawData] = useState({ followers: [], reviews: [] });
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!business?.id_business) return;
    setChartLoading(true);
    Promise.all([
      fetchAllFollowers(),
      fetchAllReviews(business.id_business),
    ])
      .then(([followers, reviews]) => setRawData({ followers, reviews }))
      .finally(() => setChartLoading(false));
  }, [business?.id_business]);

  const chartData = useMemo(() => ({
    followers: aggregateChartData(rawData.followers, 'fecha_seguimiento', period),
    reviews: aggregateChartData(rawData.reviews, 'fecha', period),
  }), [rawData, period]);

  // followers_count derivado de los datos reales ya fetched para reflejar el estado actual
  const businessWithCount = useMemo(() => {
    if (!business) return null;
    return {
      ...business,
      followers_count: rawData.followers.length > 0
        ? rawData.followers.length
        : business.followers_count,
    };
  }, [business, rawData.followers.length]);

  return {
    business: businessWithCount,
    chartData,
    rawFollowers: rawData.followers,
    loading,
    chartLoading,
    error,
    retry,
  };
}
