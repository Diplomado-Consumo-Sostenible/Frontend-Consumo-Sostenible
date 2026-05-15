import { AlertTriangle, Leaf, X } from 'lucide-react';
import { forwardRef } from 'react';
import LandingBusinessCard from '../business/LandingBusinessCard';

function SkeletonCard() {
  return <div className="animate-pulse bg-edge rounded-2xl h-64" />;
}

const ResultsGrid = forwardRef(function ResultsGrid({
  businesses = [],
  loading = false,
  error = null,
  onRetry,
  hasFilters = false,
  onClear,
  followedIds = new Set(),
  onToggleFavorite,
  onViewDetail,
}, ref) {
  return (
    <section id="explorar" ref={ref} className="bg-app-bg py-14 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header row */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">
              {hasFilters ? 'Resultados' : 'Explora la comunidad'}
            </h2>
            <p className="text-sm text-muted mt-1">
              {businesses.length} negocios encontrados
            </p>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-softest">
              <AlertTriangle className="w-8 h-8 text-muted" />
            </div>
            <p className="text-sm text-muted text-center max-w-xs">
              {error?.message ?? 'Ocurrió un error al cargar los negocios.'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 px-5 py-2 rounded-xl bg-primary-dark text-on-dark-active text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && businesses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-softest">
              <Leaf className="w-12 h-12 text-muted" />
            </div>
            <h3 className="font-serif text-lg text-heading">Sin resultados</h3>
            <p className="text-sm text-muted text-center max-w-xs">
              No encontramos negocios con esos filtros.
            </p>
            {hasFilters && onClear && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-2 border border-edge text-body rounded-xl px-4 py-2 text-sm hover:bg-primary-softest transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && businesses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {businesses.map((biz) => (
              <LandingBusinessCard
                key={biz.id_business}
                business={biz}
                variant="featured"
                isFavorite={followedIds.has(biz.id_business)}
                onToggleFavorite={onToggleFavorite}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

export default ResultsGrid;
