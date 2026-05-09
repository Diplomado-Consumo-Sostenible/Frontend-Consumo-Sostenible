import {
  AlertTriangle,
  Award,
  Building2,
  ChevronRight,
  Compass,
  Heart,
  LayoutDashboard,
  LayoutList,
  Map as MapIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BusinessDetailModal from '../../Components/ui/BusinessDetailModal';
import MapView from '../../Components/map/MapView';
import { useFollows } from '../../hooks/useFollows';
import { useToastContext } from '../../context/ToastContext';
import { getPublicBusinesses } from '../../services/business/explore.service';
import { getTiposNegocio } from '../../services/types/tiposNegocio.service';

const CATEGORY_COLORS = [
  'bg-green-50  text-green-700  border-green-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-amber-50  text-amber-700  border-amber-200',
  'bg-blue-50   text-blue-700   border-blue-200',
  'bg-teal-50   text-teal-700   border-teal-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-pink-50   text-pink-700   border-pink-200',
  'bg-cyan-50   text-cyan-700   border-cyan-200',
];

const FILTER_OPTIONS = [
  { id: 'all',       label: 'Todos',           soon: false },
  { id: 'certified', label: 'Certificados',    soon: false },
  { id: 'nearby',    label: 'Cerca de mí',     soon: true  },
  { id: 'top',       label: 'Mejor valorados', soon: true  },
];

const tagName = (t) => t.name ?? t.tagName ?? t.tag ?? '';

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 p-3.5 border border-edge rounded-2xl bg-card-bg">
          <div className="w-12 h-12 rounded-xl bg-edge shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-3.5 w-40 bg-edge rounded-full" />
            <div className="h-3 w-24 bg-edge rounded-full" />
            <div className="h-3 w-56 bg-edge rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="m-4 flex flex-col items-center justify-center gap-3 p-6 bg-card-bg rounded-2xl border border-edge text-center">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm font-semibold text-body">Error al cargar</p>
      <p className="text-xs text-muted max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-medium py-1.5 px-4 bg-primary-dark text-on-dark-active rounded-xl hover:bg-primary-darkest transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

function EmptyResults({ hasSearch, onClear }) {
  return (
    <div className="m-4 flex flex-col items-center justify-center gap-3 p-8 bg-card-bg rounded-2xl border border-edge text-center">
      <div className="w-12 h-12 bg-primary-softest rounded-2xl flex items-center justify-center">
        <Search className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm font-semibold text-body">Sin resultados</p>
      <p className="text-xs text-muted max-w-xs">
        {hasSearch
          ? 'No hay negocios que coincidan con tu búsqueda.'
          : 'No hay negocios disponibles con este filtro.'}
      </p>
      {hasSearch && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function BusinessCard({ business, isFavorite, onToggleFavorite, isSelected, onSelect }) {
  const hasCerts = business.certifications?.length > 0;

  return (
    <div
      onClick={() => onSelect(business)}
      className={`flex gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-mid bg-primary-softest shadow-sm'
          : 'border-edge bg-card-bg hover:border-primary-light hover:shadow-sm'
      }`}
    >
      <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center">
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-6 h-6 text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-heading leading-tight truncate">
            {business.businessName}
          </h4>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(business.id_business); }}
            className="shrink-0 p-0.5 rounded-lg hover:bg-red-50 transition-colors"
            aria-label={isFavorite ? 'Dejar de seguir' : 'Seguir negocio'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-muted hover:text-red-400'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {business.category?.category && (
            <span className="text-xs px-2 py-0.5 bg-primary-softest border border-edge rounded-full text-body">
              {business.category.category}
            </span>
          )}
          {hasCerts && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-ok-bg border border-ok-text/30 rounded-full text-ok-text">
              <Award className="w-3 h-3" />
              Certificado
            </span>
          )}
        </div>

        {business.description && (
          <p className="text-xs text-muted leading-snug line-clamp-2">{business.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted pt-0.5">
          {business.address && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[160px]">{business.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto shrink-0 opacity-50" title="Valoración — Próximamente">
            <Star className="w-3 h-3" />
            <span>—</span>
          </span>
        </div>

        {business.tags?.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {business.tags.slice(0, 3).map((t) => (
              <span key={t.id_tags} className="text-[10px] px-1.5 py-0.5 bg-edge/60 rounded-full text-muted">
                {tagName(t)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Explorar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ        = searchParams.get('q')        ?? '';
  const urlCategory = searchParams.get('category') ?? '';

  const [businesses,       setBusinesses]       = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [fetchKey,         setFetchKey]         = useState(0);
  const [activeFilter,     setActiveFilter]     = useState('all');
  const [selectedId,       setSelectedId]       = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showMap,          setShowMap]          = useState(false);
  const [searchInput,      setSearchInput]      = useState(urlQ);

  const { followedIds, toggleFollow } = useFollows();
  const { error: showError }          = useToastContext();

  useEffect(() => {
    getTiposNegocio()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoaded(true));
  }, []);

  useEffect(() => {
    if (!categoriesLoaded) return;
    setLoading(true);
    setError(null);

    const categoryId = urlCategory
      ? categories.find((c) => c.category === urlCategory)?.id_category
      : undefined;

    getPublicBusinesses({
      ...(categoryId !== undefined && { id_category: categoryId }),
    })
      .then((d) => setBusinesses(Array.isArray(d) ? d : []))
      .catch((err) => setError(err?.message || 'No se pudo cargar la información'))
      .finally(() => setLoading(false));
  }, [urlCategory, categoriesLoaded, fetchKey]);

  useEffect(() => { setSearchInput(urlQ); }, [urlQ]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k);
    });
    setSearchParams(next, { replace: true });
  };

  const handleSearchSubmit  = (e) => { e.preventDefault(); updateParams({ q: searchInput.trim() }); };
  const handleSearchClear   = () => { setSearchInput(''); updateParams({ q: '' }); };
  const handleCategoryClick = (name) => updateParams({ category: name });
  const handleClearAll      = () => { setSearchInput(''); setSearchParams({}, { replace: true }); };

  const handleToggleFollow = (id) => {
    toggleFollow(id, { onError: showError });
  };

  const handleSelectBusiness = (business) => {
    setSelectedId(business.id_business);
    setSelectedBusiness(business);
  };

  const filtered = useMemo(() => {
    let list = businesses;
    if (urlQ.trim()) {
      const q = urlQ.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)  ||
          b.category?.category?.toLowerCase().includes(q),
      );
    }
    if (activeFilter === 'certified') list = list.filter((b) => b.certifications?.length > 0);
    return list;
  }, [businesses, urlQ, activeFilter]);

  const filterCounts = useMemo(() => ({
    all:       businesses.length,
    certified: businesses.filter((b) => b.certifications?.length > 0).length,
  }), [businesses]);

  const hasActiveSearch = !!(urlQ || urlCategory);

  return (
    <>
      {selectedBusiness && (
        <BusinessDetailModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      )}

      <div className="flex flex-col h-screen overflow-hidden bg-app-bg">
        <div className="shrink-0 px-4 py-3 sm:px-6 bg-card-bg border-b border-edge space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="text-body font-medium">Inicio</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-body font-medium">Explorar</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-primary-dark" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-heading leading-tight">Explorar negocios</h1>
                <p className="text-xs text-muted">
                  {loading ? '…' : `${filtered.length} negocio${filtered.length !== 1 ? 's' : ''}`}
                  {hasActiveSearch && !loading && (
                    <span className="ml-1 text-primary-dark font-medium">· filtrado</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMap((v) => !v)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-edge text-xs font-medium text-body hover:border-primary-light transition-colors"
            >
              {showMap ? <LayoutList className="w-3.5 h-3.5" /> : <MapIcon className="w-3.5 h-3.5" />}
              {showMap ? 'Lista' : 'Mapa'}
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, categoría o descripción…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-edge rounded-xl bg-app-bg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all"
            />
            {(searchInput || urlQ) && (
              <button type="button" onClick={handleSearchClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {hasActiveSearch && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted shrink-0">Filtros activos:</span>
              {urlCategory && (
                <button onClick={() => handleCategoryClick('')} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-softest border border-primary-light text-primary-dark font-medium">
                  {urlCategory}<X className="w-3 h-3" />
                </button>
              )}
              {urlQ && (
                <button onClick={handleSearchClear} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-softest border border-primary-light text-primary-dark font-medium">
                  &ldquo;{urlQ}&rdquo;<X className="w-3 h-3" />
                </button>
              )}
              <button onClick={handleClearAll} className="text-[10px] text-muted hover:text-body underline underline-offset-2 transition-colors ml-1">
                Limpiar todo
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted shrink-0" />
            {FILTER_OPTIONS.map((opt) => {
              const count    = filterCounts[opt.id];
              const isActive = activeFilter === opt.id;
              if (opt.soon) {
                return (
                  <div key={opt.id} title="Próximamente" className="flex items-center gap-1 shrink-0 px-3 py-1 rounded-full border border-edge text-xs text-muted opacity-50 cursor-not-allowed select-none">
                    {opt.label}<span className="text-[10px] italic ml-0.5">· Próxim.</span>
                  </div>
                );
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(opt.id)}
                  className={`flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-dark border-primary-dark text-on-dark-active'
                      : 'border-edge text-body hover:border-primary-mid hover:text-primary-dark'
                  }`}
                >
                  {opt.label}
                  {count !== undefined && (
                    <span className={`font-bold ${isActive ? 'text-on-dark-active' : 'text-primary-dark'}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className={`flex-1 flex flex-col overflow-hidden ${showMap ? 'hidden lg:flex' : 'flex'}`}>
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorBanner message={error} onRetry={() => setFetchKey((k) => k + 1)} />
            ) : filtered.length === 0 ? (
              <EmptyResults hasSearch={hasActiveSearch} onClear={handleClearAll} />
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filtered.map((biz) => (
                  <BusinessCard
                    key={biz.id_business}
                    business={biz}
                    isFavorite={followedIds.has(biz.id_business)}
                    onToggleFavorite={handleToggleFollow}
                    isSelected={selectedId === biz.id_business}
                    onSelect={handleSelectBusiness}
                  />
                ))}

                {!hasActiveSearch && activeFilter === 'all' && categories.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-0.5">Filtrar por categoría</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat, i) => {
                        const count = businesses.filter((b) => b.category?.id_category === cat.id_category).length;
                        return (
                          <button
                            key={cat.id_category}
                            onClick={() => handleCategoryClick(cat.category)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-opacity hover:opacity-80 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
                          >
                            {cat.category}
                            <span className="font-bold">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`border-l border-edge bg-app-bg ${showMap ? 'flex flex-1' : 'hidden lg:flex'} lg:w-[260px] xl:w-[300px] lg:flex-none p-3`}>
            <MapView
              businesses={filtered}
              selectedId={selectedId}
              onSelect={(id) => {
                const biz = filtered.find((b) => b.id_business === id);
                if (biz) handleSelectBusiness(biz);
              }}
              className="w-full rounded-xl"
              compact
            />
          </div>
        </div>
      </div>
    </>
  );
}
