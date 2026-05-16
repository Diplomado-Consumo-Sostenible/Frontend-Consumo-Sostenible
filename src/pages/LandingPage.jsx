import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import usePublicReviewsTotal from '../hooks/usePublicReviewsTotal';
import BusinessDetailModal from '../Components/ui/BusinessDetailModal';
import CTABanner from '../Components/landing/CTABanner';
import FavoritesFAB from '../Components/landing/FavoritesFAB';
import HeroSection from '../Components/landing/HeroSection';
import LandingFilterBar from '../Components/landing/LandingFilterBar';
import LandingFooter from '../Components/landing/LandingFooter';
import LandingNavbar from '../Components/landing/LandingNavbar';
import MapSection from '../Components/landing/MapSection';
import ResultsGrid from '../Components/landing/ResultsGrid';
import TrendSection from '../Components/landing/TrendSection';
import { useToastContext } from '../context/ToastContext';
import { useFollows } from '../hooks/useFollows';
import { getToken } from '../utils/storage';
import usePublicBusinesses from '../hooks/usePublicBusinesses';
import useTopBusinesses from '../hooks/useTopBusinesses';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const PAGE_LOAD_TIME = Date.now();

export default function LandingPage() {
  const { hash } = useLocation();

  /* ── Scroll al hash cuando se navega desde otra ruta (éj. /#explorar) */
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // El DOM puede no estar listo aún; reintentamos una vez
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [hash]);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const resultsSectionRef                        = useRef(null);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeTagIds, setActiveTagIds]         = useState(() => new Set());
  const [sortOrder, setSortOrder]               = useState('relevant');
  const [searchText, setSearchText]             = useState('');

  const SORT_MAP = { relevant: 'relevant', rated: 'rated', reviews: 'reviews' };

  const { businesses: topBusinesses } = useTopBusinesses();

  const {
    businesses: allBusinesses,
    loading: allLoading,
    error: allError,
    retry: retryAll,
  } = usePublicBusinesses({
    sortBy: SORT_MAP[sortOrder] ?? 'recent',
    sortDirection: 'DESC',
    limit: 50,
  });

  const { followedIds, followedBusinesses, toggleFollow } = useFollows();
  const { error: showError, auth: showAuthPrompt } = useToastContext();

  const heroStats = useMemo(() => {
    const newThisWeek = allBusinesses.filter(
      (b) => b.createdAt && PAGE_LOAD_TIME - new Date(b.createdAt).getTime() < ONE_WEEK_MS,
    ).length;
    return { newThisWeek };
  }, [allBusinesses]);

  const topBusinessIds = useMemo(
    () => topBusinesses.slice(0, 4).map((b) => b.id_business),
    [topBusinesses],
  );
  const { total: totalReviews } = usePublicReviewsTotal(topBusinessIds);

  const communityFavorites = useMemo(() =>
    [...allBusinesses]
      .sort((a, b) => Number(b.followers_count ?? 0) - Number(a.followers_count ?? 0))
      .slice(0, 3),
  [allBusinesses]);

  const weeklyBusinesses = useMemo(() => topBusinesses.slice(0, 8), [topBusinesses]);

  const hasFilters = Boolean(activeCategoryId || activeTagIds.size > 0 || searchText.trim());

  const filteredAndSorted = useMemo(() => {
    let list = [...allBusinesses];

    if (activeCategoryId) {
      list = list.filter(
        (b) => (b.category?.id_category ?? b.id_category) === activeCategoryId,
      );
    }

    if (activeTagIds.size > 0) {
      list = list.filter((b) =>
        b.tags?.some((t) => activeTagIds.has(t.id_tags ?? t.id)),
      );
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.category?.category?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allBusinesses, activeCategoryId, activeTagIds, searchText]);

  const handleToggleFavorite = useCallback(
    (id) => {
      if (!getToken()) {
        showAuthPrompt('Para guardar favoritos necesitas iniciar sesión');
        return;
      }
      toggleFollow(id, { onError: showError });
    },
    [toggleFollow, showError, showAuthPrompt],
  );

  const handleTagToggle = useCallback((id) => {
    setActiveTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setActiveCategoryId(null);
    setActiveTagIds(new Set());
    setSearchText('');
  }, []);

  const handleHeroSearch = useCallback((query) => {
    if (query) setSearchText(query);
    requestAnimationFrame(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      <LandingNavbar />

      <main>
        <HeroSection
          totalBusinesses={allBusinesses.length}
          newThisWeek={heroStats.newThisWeek}
          totalReviews={totalReviews}
          avatarBusinesses={topBusinesses.slice(0, 4)}
          onSearch={handleHeroSearch}
        />

        <LandingFilterBar
          activeCategoryId={activeCategoryId}
          activeTagIds={activeTagIds}
          sortOrder={sortOrder}
          searchText={searchText}
          onCategoryChange={setActiveCategoryId}
          onTagToggle={handleTagToggle}
          onSortChange={setSortOrder}
          onSearchClear={() => setSearchText('')}
          onClear={handleClear}
        />

        {!hasFilters && (
          <TrendSection
            businesses={weeklyBusinesses}
            followedIds={followedIds}
            onToggleFavorite={handleToggleFavorite}
            onViewDetail={setSelectedBusiness}
          />
        )}

        <ResultsGrid
          ref={resultsSectionRef}
          businesses={filteredAndSorted}
          loading={allLoading}
          error={allError}
          onRetry={retryAll}
          hasFilters={hasFilters}
          onClear={handleClear}
          followedIds={followedIds}
          onToggleFavorite={handleToggleFavorite}
          onViewDetail={setSelectedBusiness}
        />

        <MapSection
          businesses={allBusinesses.slice(0, 8)}
          communityFavorites={communityFavorites}
          onViewDetail={setSelectedBusiness}
        />

        <CTABanner />
      </main>

      <LandingFooter />

      <FavoritesFAB count={followedIds.size} />

      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </div>
  );
}
