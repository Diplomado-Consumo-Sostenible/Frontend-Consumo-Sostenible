import { useCallback, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import AuthRequiredModal from '../../Components/ui/AuthRequiredModal';
import BusinessDetailModal from '../../Components/ui/BusinessDetailModal';
import LandingFilterBar from '../../Components/landing/LandingFilterBar';
import TrendSection from '../../Components/landing/TrendSection';
import ResultsGrid from '../../Components/landing/ResultsGrid';
import MapSection from '../../Components/landing/MapSection';
import { useFollows } from '../../hooks/useFollows';
import { useToastContext } from '../../context/ToastContext';
import { getToken } from '../../utils/storage';
import usePublicBusinesses from '../../hooks/usePublicBusinesses';
import useTopBusinesses from '../../hooks/useTopBusinesses';

const SORT_MAP = { relevant: 'relevant', rated: 'rated', reviews: 'reviews' };

export default function Explorar() {
  /* ── Filter state ──────────────────────────────────────── */
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeTagIds, setActiveTagIds]         = useState(() => new Set());
  const [sortOrder, setSortOrder]               = useState('relevant');
  const [searchText, setSearchText]             = useState('');
  const [searchInput, setSearchInput]           = useState('');

  /* ── UI state ─────────────────────────────────────────────── */
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showAuthModal, setShowAuthModal]       = useState(false);
  const resultsSectionRef                        = useRef(null);

  /* ── Data sources ─────────────────────────────────────────── */
  const { businesses: topBusinesses } = useTopBusinesses();

  const {
    businesses: allBusinesses,
    loading,
    error,
    retry,
  } = usePublicBusinesses({
    sortBy: SORT_MAP[sortOrder] ?? 'relevant',
    sortDirection: 'DESC',
    limit: 50,
  });

  const { followedIds, toggleFollow } = useFollows();
  const { error: showError }          = useToastContext();

  /* ── Derived data ────────────────────────────────────────── */
  const hasFilters = Boolean(activeCategoryId || activeTagIds.size > 0 || searchText.trim());

  const filteredBusinesses = useMemo(() => {
    let list = [...allBusinesses];
    if (activeCategoryId) {
      list = list.filter((b) => (b.category?.id_category ?? b.id_category) === activeCategoryId);
    }
    if (activeTagIds.size > 0) {
      list = list.filter((b) => b.tags?.some((t) => activeTagIds.has(t.id_tags ?? t.id)));
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)  ||
          b.category?.category?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allBusinesses, activeCategoryId, activeTagIds, searchText]);

  const trendBusinesses = useMemo(() => topBusinesses.slice(0, 8), [topBusinesses]);

  const communityFavorites = useMemo(
    () =>
      [...allBusinesses]
        .sort((a, b) => Number(b.followers_count ?? 0) - Number(a.followers_count ?? 0))
        .slice(0, 3),
    [allBusinesses],
  );

  /* ── Handlers ────────────────────────────────────────────── */
  const handleToggleFavorite = useCallback(
    (id) => {
      if (!getToken()) { setShowAuthModal(true); return; }
      toggleFollow(id, { onError: showError });
    },
    [toggleFollow, showError],
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
    setSearchInput('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchText(searchInput.trim());
    requestAnimationFrame(() =>
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  const handleSearchClear = useCallback(() => {
    setSearchText('');
    setSearchInput('');
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">

      {/* ── Barra de búsqueda ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-3">
        <h1 className="font-serif text-3xl sm:text-4xl text-heading tracking-tight mb-4">Explorar negocios</h1>
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, categoría o descripción…"
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-edge rounded-xl bg-card-bg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* ── Filtros, categorías y ordenamiento ──────────────────── */}
      <LandingFilterBar
        activeCategoryId={activeCategoryId}
        activeTagIds={activeTagIds}
        sortOrder={sortOrder}
        searchText={searchText}
        onCategoryChange={setActiveCategoryId}
        onTagToggle={handleTagToggle}
        onSortChange={setSortOrder}
        onSearchClear={handleSearchClear}
        onClear={handleClear}
      />

      {/* ── Carrusel de tendencias (solo sin filtros activos) ────── */}
      {!hasFilters && (
        <TrendSection
          businesses={trendBusinesses}
          followedIds={followedIds}
          onToggleFavorite={handleToggleFavorite}
          onViewDetail={setSelectedBusiness}
        />
      )}

      {/* ── Grid de resultados ───────────────────────────────── */}
      <ResultsGrid
        ref={resultsSectionRef}
        businesses={filteredBusinesses}
        loading={loading}
        error={error}
        onRetry={retry}
        hasFilters={hasFilters}
        onClear={handleClear}
        followedIds={followedIds}
        onToggleFavorite={handleToggleFavorite}
        onViewDetail={setSelectedBusiness}
      />

      {/* ── Mapa + favoritos de la comunidad ──────────────────── */}
      <MapSection
        businesses={allBusinesses.slice(0, 8)}
        communityFavorites={communityFavorites}
        onViewDetail={setSelectedBusiness}
      />

      {/* ── Modales ─────────────────────────────────────────────── */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
      {showAuthModal && (
        <AuthRequiredModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}


