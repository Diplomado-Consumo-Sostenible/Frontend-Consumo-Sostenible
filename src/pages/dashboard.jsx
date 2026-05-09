import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DashFeatured from '../Components/dashboard/DashFeatured';
import DashHero from '../Components/dashboard/DashHero';
import DashMetricCards from '../Components/dashboard/DashMetricCards';
import DashRecentlyViewed from '../Components/dashboard/DashRecentlyViewed';
import DashSearch from '../Components/dashboard/DashSearch';
import DashSidePanel from '../Components/dashboard/DashSidePanel';
import { useFollows } from '../hooks/useFollows';
import useUserProfile from '../hooks/useUserProfile';
import { useToastContext } from '../context/ToastContext';
import { getPublicBusinesses } from '../services/business/explore.service';

function LoadingState() {
  return (
    <div className="px-4 py-5 sm:px-6 lg:pl-10 lg:pr-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-[200px] bg-edge rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-edge rounded-2xl" />)}
          </div>
          <div className="h-28 bg-edge rounded-2xl" />
          <div className="h-56 bg-edge rounded-2xl" />
        </div>
        <div className="space-y-5">
          <div className="h-48 bg-edge rounded-2xl" />
          <div className="h-64 bg-edge rounded-2xl" />
          <div className="h-28 bg-edge rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="px-4 py-5 sm:px-6 lg:pl-10 lg:pr-8">
      <div className="flex flex-col items-center justify-center min-h-[220px] bg-card-bg rounded-2xl shadow p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-body">Error al cargar</h2>
        <p className="text-sm text-muted mt-1 max-w-xs">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 text-xs font-medium py-2 px-4 rounded-xl text-white transition-colors"
            style={{ background: '#2E6B47' }}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, loading, error, retry }                            = useUserProfile();
  const { followedBusinesses, followedIds, loading: loadingFollows, toggleFollow } = useFollows();
  const { error: showError }                                          = useToastContext();
  const [businesses, setBusinesses]                                   = useState([]);
  const [loadingBiz, setLoadingBiz]                                   = useState(true);
  const recentlyViewedRef                                             = useRef(null);

  const scrollToRecentlyViewed = useCallback(() => {
    recentlyViewedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const fetchBusinesses = useCallback(() => {
    getPublicBusinesses()
      .then((d) => setBusinesses(Array.isArray(d) ? d : []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoadingBiz(false));
  }, []);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  const handleToggleFollow = useCallback((id) => {
    toggleFollow(id, { onError: showError });
  }, [toggleFollow, showError]);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={retry} />;

  return (
    <div className="px-4 pt-8 pb-5 sm:px-6 sm:pt-10 sm:pb-6 lg:pl-10 lg:pr-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <DashMetricCards
            businesses={businesses}
            loadingBusinesses={loadingBiz}
            followCount={followedBusinesses.length}
            loadingFollows={loadingFollows}
          />
          <DashHero profile={profile} onViewList={scrollToRecentlyViewed} />
          <DashSearch />
          <DashFeatured
            businesses={businesses}
            loadingBusinesses={loadingBiz}
            followedIds={followedIds}
            onToggleFollow={handleToggleFollow}
          />
          <DashRecentlyViewed
            ref={recentlyViewedRef}
            businesses={businesses}
            followedIds={followedIds}
            onToggleFollow={handleToggleFollow}
          />
        </div>
        <div className="lg:col-span-1">
          <DashSidePanel
            businesses={businesses}
            followedBusinesses={followedBusinesses}
            loadingFollows={loadingFollows}
          />
        </div>
      </div>
    </div>
  );
}
